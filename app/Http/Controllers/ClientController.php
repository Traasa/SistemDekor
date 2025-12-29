<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Client::withCount('orders');

        // Search functionality
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('phone', 'like', "%{$searchTerm}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $clients = $query->paginate(10);

        return Inertia::render('admin/clients/index', [
            'clients' => $clients,
            'filters' => [
                'search' => $request->search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Get clients for API endpoint
     */
    public function getClients(Request $request)
    {
        $query = Client::withCount('orders');

        // Search functionality
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('phone', 'like', "%{$searchTerm}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $clients = $query->paginate($request->get('per_page', 10));

        return response()->json($clients);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
        ]);

        $client = Client::create($validated);

        return response()->json([
            'message' => 'Client berhasil ditambahkan',
            'client' => $client,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $client = Client::with([
            'orders' => function($query) {
                $query->latest()->take(10);
            }
        ])->withCount('orders')->findOrFail($id);

        return response()->json($client);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email,' . $id,
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
        ]);

        $client->update($validated);

        return response()->json([
            'message' => 'Client berhasil diupdate',
            'client' => $client,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $client = Client::findOrFail($id);
        
        // Check if client has any orders
        if ($client->orders()->count() > 0) {
            return response()->json([
                'message' => 'Tidak dapat menghapus client yang memiliki order',
            ], 422);
        }

        $client->delete();

        return response()->json([
            'message' => 'Client berhasil dihapus',
        ]);
    }

    /**
     * Get client statistics
     */
    public function getStats()
    {
        $totalClients = Client::count();
        $totalOrders = Client::withCount('orders')->get()->sum('orders_count');
        $clientsWithOrders = Client::has('orders')->count();
        $clientsWithoutOrders = Client::doesntHave('orders')->count();

        return response()->json([
            'total_clients' => $totalClients,
            'total_orders' => $totalOrders,
            'clients_with_orders' => $clientsWithOrders,
            'clients_without_orders' => $clientsWithoutOrders,
        ]);
    }
}
