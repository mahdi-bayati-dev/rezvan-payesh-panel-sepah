<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

class Organization extends Model
{
    use HasFactory,HasRecursiveRelationships;
    protected $fillable = ['name', 'parent_id'];
}
