<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventOutlineItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'order',
        'title',
        'description',
        'planned_time',
        'status',
        'is_default',
    ];

    protected $casts = [
        'planned_time' => 'datetime:H:i',
        'is_default' => 'boolean',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
