<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;

/** Catálogo de categorías musicales. */
class CategoryController extends Controller
{
    /** Devuelve todas las categorías ordenadas por nombre (para los selects). */
    public function index(): JsonResponse
    {
        return response()->json([
            'categories' => Category::orderBy('name')->get(),
        ]);
    }
}
