<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MiniOrder;
use App\Models\MiniOrderImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MiniOrderImageController extends Controller
{
    public function store(Request $request, MiniOrder $miniOrder)
    {
        $request->validate([
            'images' => 'required|array|min:1',
            'images.*' => 'file|max:3072',
        ]);

        $images = [];

        foreach ($request->file('images', []) as $file) {
            $path = $file->store('mini_order_images', 'public');
            $images[] = MiniOrderImage::create([
                'mini_order_id' => $miniOrder->id,
                'image_path' => $path,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => collect($images)->map(function (MiniOrderImage $image) {
                return [
                    'id' => $image->id,
                    'image_url' => $image->image_url,
                    'image_path' => $image->image_path,
                ];
            }),
        ]);
    }

    public function destroy(MiniOrder $miniOrder, MiniOrderImage $image)
    {
        if ((int) $image->mini_order_id !== (int) $miniOrder->id) {
            return response()->json([
                'success' => false,
                'message' => 'Image tidak valid untuk mini order ini.',
            ], 422);
        }

        if ($image->image_path) {
            Storage::disk('public')->delete($image->image_path);
        }

        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Image berhasil dihapus.',
        ]);
    }
}
