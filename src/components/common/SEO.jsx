import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
    title, 
    description, 
    keywords, 
    image, 
    url, 
    type = 'website',
    schemaData
}) => {
    const siteName = 'Buy Ayurvedic Products Online | Prolific Healing Herbs – 100% Natural Herbal Remedies';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDescription = 'Discover authentic Ayurvedic products and natural herbal remedies at Prolific Healing Herbs. Shop 100% pure, Ayurvedic-certified wellness products for immunity, skin health, detox, and vitality. Experience holistic healing the natural way!';
    const metaDescription = description || defaultDescription;
    const metaKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    const siteUrl = 'https://prolifichealingherbs.com'; // Replace with actual production URL if available
    const canonicalUrl = url ? `${siteUrl}${url}` : siteUrl;
    const ogImage = image || `${siteUrl}/prolific-og-image.jpg`; // Default OG image

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {metaKeywords && <meta name="keywords" content={metaKeywords} />}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={ogImage} />

            {/* Structured Data (JSON-LD) */}
            {schemaData && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
