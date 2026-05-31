<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MiniOrderImage extends Model
{
    protected $fillable = [
        'mini_order_id',
        'image_path',
    ];

    protected $appends = [
        'image_url',
    ];

    public function miniOrder(): BelongsTo
    {
        return $this->belongsTo(MiniOrder::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        return asset('storage/' . $this->image_path);
    }
}
