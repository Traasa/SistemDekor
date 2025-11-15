<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClientController extends Controller
{
    public function index(): JsonResponse
    {
        $clients = Client::orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $clients]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $client = Client::create($validated);
        return response()->json(['success' => true, 'data' => $client], 201);
    }

    public function show(Client $client): JsonResponse
    {
        $client->load('orders');
        return response()->json(['success' => true, 'data' => $client]);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $client->update($validated);
        return response()->json(['success' => true, 'data' => $client]);
    }

    public function destroy(Client $client): JsonResponse
    {
        $client->delete();
        return response()->json(['success' => true, 'message' => 'Client deleted']);
    }
}
