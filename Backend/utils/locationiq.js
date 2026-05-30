// Dummy haversine formula — you can replace it with LocationIQ API calls
function calculateDistance(loc1, loc2) {
    const R = 6371; // Earth radius in km
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
    const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(loc1.lat * (Math.PI / 180)) *
        Math.cos(loc2.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // in km
}
exports.findNearest = async (pickup, captains) => {
    let nearest = null;
    let minDistance = Infinity;

    for (const captain of captains) {
        if (!captain.location?.ltd || !captain.location?.lng) continue;
        const distance = calculateDistance(pickup, {
            lat: captain.location.ltd,
            lng: captain.location.lng
        });

        if (distance < minDistance) {
            minDistance = distance;
            nearest = captain;
        }
    }

    return nearest;
};
