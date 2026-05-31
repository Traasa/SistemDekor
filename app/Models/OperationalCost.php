<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperationalCost extends Model
{
    protected $fillable = [
        'cost_code',
        'cost_type',
        'title',
        'description',
        'amount',
        'cost_date',
        'reference_type',
        'reference_id',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'cost_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateCode(): string
    {
        $latest = static::query()->latest('id')->first();
        $number = $latest ? ((int) substr($latest->cost_code, 5) + 1) : 1;

        return 'COST-' . str_pad((string) $number, 6, '0', STR_PAD_LEFT);
    }
}
