const REVIEWS_DATA = [
  {
    id: "r1",
    place: "Jaipur",
    author: "Ananya S.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Amber Fort at 8 AM before the heat kicked in was magical. The audio guide is worth every rupee.",
    category: "Solo female",
    location: "Amer, Jaipur",
    createdAt: "2 days ago",
  },
  {
    id: "r2",
    place: "Jaipur",
    author: "Rohan M.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    rating: 4,
    text: "Pyaaz kachori at Rawat Misthan Bhandar lived up to the hype. Auto rickshaws need hard bargaining.",
    category: "Foodie",
    location: "MI Road, Jaipur",
    createdAt: "5 days ago",
  },
  {
    id: "r3",
    place: "Goa",
    author: "Priya & Dev",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Rent a scooter from Thivim station directly — saved us ₹2,000 on taxis over 4 days.",
    category: "Couple",
    location: "Fontainhas, Panjim",
    createdAt: "1 week ago",
  },
];

const listReviews = (req, res) => {
  const { place } = req.query;
  let results = REVIEWS_DATA;
  if (place) {
    const p = String(place).trim().toLowerCase();
    results = REVIEWS_DATA.filter((r) => r.place.toLowerCase().includes(p));
  }
  res.json(results);
};

const createReview = (req, res) => {
  const { place, rating, text, category, location } = req.body;
  const newReview = {
    id: `r_${Date.now()}`,
    place: place || "General",
    author: "You (Verified Traveller)",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    rating: Number(rating) || 5,
    text: text || "Great experience!",
    category: category || "General",
    location: location || "India",
    createdAt: "Just now",
  };
  REVIEWS_DATA.unshift(newReview);
  res.status(201).json(newReview);
};

module.exports = {
  listReviews,
  createReview,
};
