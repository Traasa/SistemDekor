<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\Portfolio;
use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicController extends Controller
{
    /**
     * Display home page
     */
    public function home()
    {
        $featuredPortfolios = Portfolio::where('is_featured', true)
            ->latest()
            ->take(6)
            ->get();

        $packages = Package::where('is_active', true)
            ->orderBy('base_price')
            ->get();

        return Inertia::render('Public/Home', [
            'portfolios' => $featuredPortfolios,
            'packages' => $packages,
        ]);
    }

    /**
     * Display about page
     */
    public function about()
    {
        $companyProfile = CompanyProfile::first();

        return Inertia::render('Public/About', [
            'company' => $companyProfile,
        ]);
    }

    /**
     * Display services/packages page
     */
    public function services()
    {
        $packages = Package::where('is_active', true)
            ->orderBy('base_price')
            ->get();

        return Inertia::render('Public/Services', [
            'packages' => $packages,
        ]);
    }

    /**
     * Display package detail
     */
    public function packageDetail($slug)
    {
        $package = Package::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $otherPackages = Package::where('is_active', true)
            ->where('id', '!=', $package->id)
            ->take(3)
            ->get();

        return Inertia::render('Public/PackageDetail', [
            'package' => $package,
            'otherPackages' => $otherPackages,
        ]);
    }

    /**
     * Display gallery/portfolio page
     */
    public function gallery()
    {
        $portfolios = Portfolio::latest()
            ->paginate(12);

        $categories = Portfolio::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->pluck('category');

        return Inertia::render('Public/Gallery', [
            'portfolios' => $portfolios,
            'categories' => $categories,
        ]);
    }

    /**
     * Display contact page
     */
    public function contact()
    {
        $companyProfile = CompanyProfile::first();

        return Inertia::render('Public/Contact', [
            'company' => $companyProfile,
        ]);
    }
}
