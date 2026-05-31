<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VendorClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorClientController extends Controller
{
    public function index(): JsonResponse
    {
        $clients = VendorClient::orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $clients]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $client = VendorClient::create($validated);

        return response()->json(['success' => true, 'data' => $client], 201);
    }

    public function show(VendorClient $vendorClient): JsonResponse
    {
        $vendorClient->load('miniOrders');
        return response()->json(['success' => true, 'data' => $vendorClient]);
    }

    public function update(Request $request, VendorClient $vendorClient): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $vendorClient->update($validated);

        return response()->json(['success' => true, 'data' => $vendorClient]);
    }

    public function destroy(VendorClient $vendorClient): JsonResponse
    {
        $vendorClient->delete();
        return response()->json(['success' => true, 'message' => 'Vendor client deleted']);
    }
}
