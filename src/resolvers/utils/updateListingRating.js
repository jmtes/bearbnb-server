const updateListingRating = async (review, listingId, mutation, prisma) => {
  const listing = await prisma.query.listing(
    { where: { id: listingId } },
    '{ ratingSum reviewCount rating }'
  );

  const data = {
    ratingSum: listing.ratingSum,
    reviewCount: listing.reviewCount,
    rating: listing.rating
  };

  if (mutation === 'CREATE') {
    data.ratingSum += review.rating;
    data.reviewCount += 1;
    data.rating = parseInt((data.ratingSum / data.reviewCount).toFixed(2), 10);

    await prisma.mutation.updateListing({ where: { id: listingId }, data });
  } else if (mutation === 'UPDATE') {
    data.ratingSum += review.rating - review.oldRating;
    data.rating = parseInt((data.ratingSum / data.reviewCount).toFixed(2), 10);

    await prisma.mutation.updateListing({ where: { id: listingId }, data });
  } else if (mutation === 'DELETE') {
    data.ratingSum -= review.rating;
    data.reviewCount -= 1;
    data.rating = data.reviewCount
      ? parseInt((data.ratingSum / data.reviewCount).toFixed(2), 10)
      : 0;

    await prisma.mutation.updateListing({ where: { id: listingId }, data });
  }
};

export default updateListingRating;
