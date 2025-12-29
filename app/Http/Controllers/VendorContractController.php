<?php

namespace App\Http\Controllers;

use App\Models\VendorContract;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VendorContractController extends Controller
{
    public function index(Request $request)
    {
        $query = VendorContract::with(['vendor.category', 'creator']);

        // Filters
        if ($request->has('vendor_id') && $request->vendor_id) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('contract_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhereHas('vendor', function($vq) use ($search) {
                      $vq->where('company_name', 'like', "%{$search}%");
                  });
            });
        }

        $contracts = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $contracts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'contract_value' => 'required|numeric|min:0',
            'payment_schedule' => 'required|in:one_time,monthly,quarterly,per_project',
            'status' => 'nullable|in:draft,active,expired,terminated,renewed',
            'terms_conditions' => 'nullable|string',
            'deliverables' => 'nullable|array',
            'signed_by_vendor' => 'nullable|string|max:255',
            'signed_by_company' => 'nullable|string|max:255',
            'signed_date' => 'nullable|date',
            'contract_file' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'notes' => 'nullable|string'
        ]);

        // Handle file upload
        if ($request->hasFile('contract_file')) {
            $path = $request->file('contract_file')->store('contracts', 'public');
            $validated['contract_file'] = $path;
        }

        $validated['created_by'] = auth()->id();

        $contract = VendorContract::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Contract created successfully',
            'data' => $contract->load(['vendor', 'creator'])
        ], 201);
    }

    public function show($id)
    {
        $contract = VendorContract::with(['vendor.category', 'creator'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $contract
        ]);
    }

    public function update(Request $request, $id)
    {
        $contract = VendorContract::findOrFail($id);

        $validated = $request->validate([
            'vendor_id' => 'sometimes|exists:vendors,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'contract_value' => 'sometimes|numeric|min:0',
            'payment_schedule' => 'sometimes|in:one_time,monthly,quarterly,per_project',
            'status' => 'sometimes|in:draft,active,expired,terminated,renewed',
            'terms_conditions' => 'nullable|string',
            'deliverables' => 'nullable|array',
            'signed_by_vendor' => 'nullable|string|max:255',
            'signed_by_company' => 'nullable|string|max:255',
            'signed_date' => 'nullable|date',
            'contract_file' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'notes' => 'nullable|string'
        ]);

        // Handle file upload
        if ($request->hasFile('contract_file')) {
            // Delete old file if exists
            if ($contract->contract_file) {
                Storage::disk('public')->delete($contract->contract_file);
            }
            $path = $request->file('contract_file')->store('contracts', 'public');
            $validated['contract_file'] = $path;
        }

        $contract->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Contract updated successfully',
            'data' => $contract->load(['vendor', 'creator'])
        ]);
    }

    public function destroy($id)
    {
        $contract = VendorContract::findOrFail($id);

        // Delete file if exists
        if ($contract->contract_file) {
            Storage::disk('public')->delete($contract->contract_file);
        }

        $contract->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contract deleted successfully'
        ]);
    }

    public function activeContracts()
    {
        $contracts = VendorContract::with(['vendor.category'])
            ->active()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contracts
        ]);
    }

    public function expiringContracts(Request $request)
    {
        $days = $request->input('days', 30);
        
        $contracts = VendorContract::with(['vendor.category'])
            ->expiring($days)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contracts
        ]);
    }

    public function expiredContracts()
    {
        $contracts = VendorContract::with(['vendor.category'])
            ->expired()
            ->where('status', '!=', 'expired')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contracts
        ]);
    }

    public function byVendor($vendorId)
    {
        $contracts = VendorContract::where('vendor_id', $vendorId)
            ->with('creator')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contracts
        ]);
    }

    public function renewContract($id)
    {
        $oldContract = VendorContract::findOrFail($id);
        
        // Create new contract based on old one
        $newContract = $oldContract->replicate();
        $newContract->status = 'draft';
        $newContract->start_date = $oldContract->end_date->addDay();
        $newContract->end_date = $newContract->start_date->addYear();
        $newContract->signed_by_vendor = null;
        $newContract->signed_by_company = null;
        $newContract->signed_date = null;
        $newContract->created_by = auth()->id();
        $newContract->save();

        // Update old contract status
        $oldContract->update(['status' => 'renewed']);

        return response()->json([
            'success' => true,
            'message' => 'Contract renewed successfully',
            'data' => $newContract->load(['vendor', 'creator'])
        ]);
    }
}
