<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MiniOrderPaymentProof extends Model
{
    const STATUS_PENDING = 'pending';
    const STATUS_VERIFIED = 'verified';
    const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'mini_order_id',
        'amount',
        'payment_type',
        'proof_image_path',
        'status',
        'verified_by',
        'verified_at',
        'admin_notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    public function miniOrder(): BelongsTo
    {
        return $this->belongsTo(MiniOrder::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function getProofImageUrlAttribute(): ?string
    {
        if (!$this->proof_image_path || str_starts_with($this->proof_image_path, 'offline:')) {
            return null;
        }

        return Storage::url($this->proof_image_path);
    }
}
