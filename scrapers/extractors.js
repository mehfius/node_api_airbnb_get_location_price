function extractName($, element) {
    const nameMeta = $(element).find('meta[itemprop="name"]').attr('content');
    return nameMeta || null;
}

function extractRoomId($, element) {
    const urlMeta = $(element).find('meta[itemprop="url"]').attr('content');
    if (!urlMeta) return null;
    const roomIdRegex = /\/rooms\/(\d+)\?/;
    const match = urlMeta.match(roomIdRegex);
    return match && match[1] ? match[1] : null;
}

function extractTotalReviews($, element) {
    const targetSvg = $(element).find('svg:has(path[fill-rule="evenodd"])');
    if (!targetSvg.length) return null;
    const immediateParentSpan = targetSvg.parent();
    if (!immediateParentSpan.length) return null;
    const grandParentSpan = immediateParentSpan.parent();
    if (!grandParentSpan.length) return null;
    const ratingSpan = grandParentSpan.find('> span:last-child');
    if (!ratingSpan.length) return null;
    const textContent = ratingSpan.text().trim();
    const match = textContent.match(/(\d+,\d+)\s*\((\d+)\)/);
    return match ? parseInt(match[2], 10) : null;
}

function extractScore($, element) {
    const targetSvg = $(element).find('svg:has(path[fill-rule="evenodd"])');
    if (!targetSvg.length) return null;
    const immediateParentSpan = targetSvg.parent();
    if (!immediateParentSpan.length) return null;
    const grandParentSpan = immediateParentSpan.parent();
    if (!grandParentSpan.length) return null;
    const ratingSpan = grandParentSpan.find('> span:last-child');
    if (!ratingSpan.length) return null;
    const textContent = ratingSpan.text().trim();
    const match = textContent.match(/(\d+,\d+)\s*\((\d+)\)/);
    return match ? parseFloat(match[1].replace(',', '.')) : null;
}

function extractPrice($, element) {
    const buttons = $(element).find('button[type="button"]');
    for (const button of buttons) {
        const priceSpan = $(button).find('span').filter((i, span) => $(span).text().trim().startsWith('R$'));
        if (priceSpan.length) {
            return priceSpan.text().trim().replace(/[^0-9]/g, '');
        }
    }
    return null;
}

module.exports = {
    extractName,
    extractRoomId,
    extractTotalReviews,
    extractScore,
    extractPrice
};
