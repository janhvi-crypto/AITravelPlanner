const supabase = require("../config/database");

const createTrip = async (tripData) => {
    const { data, error } = await supabase
        .from("trips")
        .insert([tripData])
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

const getTripHistory = async () => {
    const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
};

const getTripById = async (id) => {
    const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    return data;
};

const updateTrip = async (id, tripData) => {
    const { data, error } = await supabase
        .from("trips")
        .update(tripData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

const deleteTrip = async (id) => {
    const { data, error } = await supabase
        .from("trips")
        .delete()
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

module.exports = {
    createTrip,
    getTripHistory,
    getTripById,
    updateTrip,
    deleteTrip
};
