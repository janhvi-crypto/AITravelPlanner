# WanderWise AI

take reference of this image for ui. using Javascript, html react , node stuff. develop. 'Ai travel Planner' it is for generating itinerary using ai . leave end points for backend to be made by me . here are the key features: AI Travel Planner

Tech Stack

Frontend

React.js (Vite)

Tailwind CSS

shadcn/ui

React Hook Form

Framer Motion

Axios

Backend

Node.js

Express.js

AI

OpenAI API (GPT-5.5 or GPT-4.1)

or

Gemini API

Maps

Google Maps API

or

Mapbox

Weather

OpenWeather API

Deployment

Frontend → Vercel

Backend → Render

No MongoDB required.Overall Architecture

                User

                  │

                  │

          React Frontend

                  │

                  │

        POST /generate-trip

                  │

                  ▼

          Express Backend

        Validate User Input

                  │

                  │

       Build Prompt for AI

                  │

                  ▼

          OpenAI / Gemini

                  │

                  │

          JSON Response

                  │

                  ▼

        React displays

    • Itinerary

    • Places

    • Food

    • Packing List

    • Budget Split

User Flow

Landing Page

        │

        ▼

Travel Form

Destination

Budget

Days

Travel Style

Companions

Transport

        │

        ▼

Generate Trip

        │

        ▼

Backend

        │

        ▼

AI Prompt

        │

        ▼

Receive Structured JSON

        │

        ▼

Display Beautiful Travel Guide

Folder Structure

AI-Travel-Planner

client/

    src/

        components/

            Hero.jsx

            TravelForm.jsx

            ItineraryCard.jsx

            PackingCard.jsx

            FoodCard.jsx

            PlacesCard.jsx

            BudgetCard.jsx

            Navbar.jsx

            Footer.jsx

        pages/

            Home.jsx

            Result.jsx

        services/

            api.js

        App.jsx

server/

    routes/

        trip.js

    controllers/

        tripController.js

    services/

        aiService.js

    prompts/

        travelPrompt.js

    app.js

    package.json

Frontend Pages

Home

Large Hero

Plan Your Perfect Trip

Input Form

Destination

Budget

Days

Travel Style

Solo

Friends

Family

Luxury

Backpacking

Adventure

Relaxation

Transport

Flight

Train

Bus

Car

Generate Trip

Loading Screen

Animated Globe

Finding hidden gems...

Planning routes...

Searching famous food...

Preparing packing list...

Results Page

Contains

Overview

Budget Breakdown

Day Wise Plan

Places to Visit

Restaurants

Packing List

Travel Tips

Weather

Emergency Numbers

Map

Backend APIs

POST

/generate-trip

Body

{

"destination":"Goa",

"budget":"25000",

"days":"4",

"style":"Adventure"

}

Returns

{

"overview":{},

"itinerary":[],

"places":[],

"food":[],

"packing":[]

}

AI Prompt Engineering

Instead of asking AI many times...

Ask once.

Example Prompt

You are an expert travel planner.

Create a travel guide.

Destination:

Goa

Budget:

25000 INR

Days:

4

Return JSON only.

Include

Overview

Day-wise itinerary

Morning

Afternoon

Evening

Budget Breakdown

Transportation

Hotel

Food

Activities

Top Places

Local Foods

Packing List

Weather Advice

Travel Tips

Emergency Contacts

Hidden Gems

Return valid JSON.

AI returns

{

  "overview": {},

  "budget": {},

  "days": [

  ],

  "foods":[

  ],

  "packing":[

  ]

}

Features

1. AI Itinerary

Example

Day 1

Breakfast

Visit Fort Aguada

Lunch

Baga Beach

Sunset

Cruise

Dinner

Fisherman's Wharf

2. Budget Split

Hotel

8000

Transport

4000

Food

5000

Activities

6000

Shopping

2000

3. Packing List

AI generates

Passport

Power Bank

Sunglasses

Hat

Shoes

Medicines

Water Bottle

Raincoat

depending on destination.

4. Places to Visit

Popular Attractions

Hidden Gems

Temples

Museums

Nightlife

Markets

Photography Spots

5. Local Food Suggestions

Must Try

Street Food

Vegetarian

Desserts

Cafe Recommendations

6. Weather Tips

Example

Expected Temperature

Carry Umbrella

Wear Cotton

Avoid Afternoon Heat

(OpenWeather API)

7. Interactive Map

Show markers

Hotel

Restaurant

Tourist Spots

8. Daily Expense Estimation

AI estimates

Breakfast

300

Lunch

500

Dinner

700

Cab

1000

9. Travel Tips

AI

Avoid scams

Best local transport

Best shopping market

Best sunrise point

Safety tips

Component Architecture

App

│

Navbar

│

Hero

│

TravelForm

│

Loading

│

Results

│

OverviewCard

BudgetCard

MapCard

FoodCard

PackingCard

ItineraryCard

PlacesCard

Footer

Express Backend Flow

Receive Request

↓

Validate

↓

Build Prompt

↓

Call AI

↓

Parse JSON

↓

Return Response

APIs Used

Purpose	API

AI	OpenAI / Gemini

Maps	Google Maps

Weather	OpenWeather

Images (optional)	Unsplash API

UI Design

Hero

Beautiful Background

↓

Glassmorphism Form

↓

Animated Loading

↓

Travel Dashboard

Cards

Timeline

Map

Budget

Packing

Food

Weather

Optional AI Enhancements

Budget optimization: Suggest cheaper hotels, transport, or attractions if the user's budget is tight.

Alternative plans: Generate "Rainy Day" or "Low Budget" alternatives.

Family vs Solo personalization: Tailor activities, food, and pacing based on companions.

Local etiquette & culture: Include customs, dress codes, tipping practices, and useful local phrases.

Safety insights: Highlight common tourist scams, emergency contacts, and safe neighborhoods.

Downloadable itinerary: Generate a PDF of the complete travel plan.

Shareable trip link: Encode the trip configuration in the URL so it can be shared without storing data.# ✈️ AI Travel Planner (MERN + AI, No Database)

## Project Overview

AI Travel Planner is an intelligent web application that creates a complete personalized travel plan in seconds. Instead of searching dozens of websites, users simply enter a few details, and the AI generates a customized itinerary, budget allocation, packing list, food recommendations, transportation suggestions, weather advice, hidden gems, safety tips, and much more.

The application does **not require a database**. Every request is generated dynamically using an LLM (OpenAI or Gemini) and external APIs (Weather and Maps).

---

# Core Features

---

# 1. Smart Travel Form

### User Inputs

* Destination

* Total Budget

* Number of Days

* Starting Location (Optional)

* Travel Dates (Optional)

* Travel Style

  * Backpacking

  * Luxury

  * Adventure

  * Family

  * Romantic

  * Business

  * Solo

* Number of Travelers

* Preferred Transportation

* Dietary Preference

* Accessibility Needs

* Interests

  * Nature

  * Beaches

  * Hiking

  * Shopping

  * Food

  * Historical

  * Nightlife

  * Photography

* Preferred Activity Pace

  * Relaxed

  * Balanced

  * Packed

---

# 2. AI Generated Trip Summary

The AI first generates an overview before diving into the itinerary.

Example

```

Destination:

Goa

Duration:

5 Days

Estimated Budget:

₹30,000

Best Time:

November-February

Travel Style:

Adventure + Beaches

Overall Experience:

Relaxing coastal vacation with water sports,

local food, nightlife and sightseeing.

```

---

# 3. Complete Day-wise Itinerary

The AI creates a detailed schedule for every day.

Every day contains:

Morning

* Breakfast suggestion

* Attraction

* Travel time

* Estimated cost

Afternoon

* Lunch

* Main activity

* Nearby attractions

Evening

* Sunset point

* Shopping

* Cultural experience

Night

* Dinner

* Nightlife

* Hotel return

Example

```

Day 2

8 AM

Breakfast at local cafe

9 AM

Visit Fort Aguada

11 AM

Explore Sinquerim Beach

1 PM

Lunch

3 PM

Parasailing

5 PM

Beach walk

7 PM

Dinner

9 PM

Casino Cruise

```

---

# 4. AI Budget Planner

The AI intelligently distributes the budget.

Example

```

Budget

Hotel

₹12,000

Transport

₹5,000

Food

₹6,000

Activities

₹5,000

Shopping

₹2,000

```

If budget is too low

AI automatically suggests

* Hostels

* Shared taxis

* Public transport

* Free attractions

---

# 5. AI Packing List

Packing changes according to

Destination

Season

Weather

Travel style

Duration

Example

Beach

```

Swimsuit

Flip flops

Suncream

Sunglasses

Power bank

```

Mountain

```

Jacket

Thermals

Gloves

Medicine

Waterproof shoes

```

Business Trip

```

Laptop

Formal clothes

Documents

Chargers

Business cards

```

---

# 6. Must Visit Places

AI divides attractions into categories.

Popular

```

Eiffel Tower

Louvre

Arc de Triomphe

```

Hidden Gems

```

Local cafes

Secret viewpoints

Small museums

```

Family Friendly

Adventure

Shopping

Photography Spots

Nature

Historical Sites

Free Attractions

---

# 7. Local Food Recommendations

Instead of generic restaurants,

AI recommends

Must Try Foods

Street Food

Vegetarian

Vegan

Fine Dining

Budget Restaurants

Desserts

Drinks

Example

```

Goa

Fish Curry

Bebinca

Prawn Balchão

Vindaloo

Feni

```

---

# 8. Restaurant Suggestions

Organized by

Breakfast

Lunch

Dinner

Street Food

Cafes

Fine Dining

Late Night

Each recommendation includes

* Average Cost

* Best Dish

* Distance (optional with Maps API)

---

# 9. Weather Information

Using OpenWeather API

Displays

Current Temperature

Humidity

Rain Probability

UV Index

Sunrise

Sunset

Weather Warnings

AI converts weather into advice

Example

```

Expected Rain

Carry umbrella

Avoid trekking

Wear waterproof shoes

```

---

# 10. Interactive Map

Google Maps

Displays

Hotel

Restaurants

Tourist Attractions

Metro Stations

Bus Stops

Hospitals

ATMs

Airport

Users can click any marker.

---

# 11. Transportation Guide

AI compares

Taxi

Metro

Train

Bus

Rental Scooter

Rental Bike

Walking

Example

```

Airport → Hotel

Taxi

₹600

35 minutes

Metro

₹60

55 minutes

```

---

# 12. Travel Cost Estimator

Every activity contains estimated expenses.

Example

```

Breakfast ₹250

Lunch ₹400

Museum ₹500

Taxi ₹300

Dinner ₹700

Total

₹2150

```

---

# 13. Hidden Gems

AI recommends

Unknown cafes

Local markets

Quiet beaches

Viewpoints

Small villages

Photography locations

Most travel apps don't provide this.

---

# 14. Safety Assistant

Includes

Emergency Numbers

Tourist Police

Nearby Hospitals

Scam Alerts

Unsafe Areas

Night Safety Tips

Women Safety Tips

Medical Advice

---

# 15. Cultural Guide

AI explains

Dress Code

Greetings

Local Etiquette

Temple Rules

Photography Rules

Tipping

Local Customs

Useful Local Phrases

---

# 16. Travel Checklist

Before Trip

Passport

Tickets

Hotel Booking

Medicines

Insurance

Power Bank

ID Proof

After Arrival

SIM Card

Currency Exchange

Transport Card

Emergency Contact

---

# 17. Best Time to Visit

AI explains

Peak Season

Off Season

Cheapest Season

Festival Season

Monsoon

Weather Comparison

Crowd Levels

---

# 18. Alternative Plans

Rain Plan

Budget Plan

Luxury Upgrade

Family Version

Kids Version

Senior Citizen Version

Weekend Version

---

# 19. AI Travel Tips

Examples

```

Visit beaches before 10 AM

Carry cash

Use local buses

Avoid tourist traps

Book tickets online

Try local breakfast

Don't visit on Mondays

```

---

# 20. Daily Timeline

Visual timeline

```

8 AM

Breakfast

↓

10 AM

Museum

↓

1 PM

Lunch

↓

4 PM

Beach

↓

7 PM

Dinner

```

---

# 21. Nearby Recommendations

When user selects one attraction

AI recommends nearby

Restaurant

Cafe

Museum

Shopping

Park

Hotel

within walking distance.

---

# 22. Photo Spots

AI recommends

Instagram-worthy places

Golden hour timings

Sunrise points

Drone-friendly locations

Best camera settings (optional)

---

# 23. Estimated Crowd Levels

AI predicts

Morning

Afternoon

Evening

Best time to visit

Least crowded hours

---

# 24. Souvenir Guide

Suggests

Local handicrafts

Traditional clothes

Famous snacks

Spices

Art

Authentic markets

---

# 25. AI Trip Optimization

AI ensures

* Nearby attractions are grouped together to reduce travel time.

* Expensive activities are balanced across the trip.

* Meals fit within the selected budget.

* The itinerary matches the chosen travel pace (relaxed, balanced, or packed).

* Weather is considered when ordering outdoor activities.

---

# 26. Download & Share

Generate a complete trip report that users can:

* Download as a PDF.

* Print for offline use.

* Share with friends via a shareable link containing the trip parameters (no database required).

---

# 27. Responsive Dashboard

A clean dashboard presents all information in sections:

```

--------------------------------------------------

Trip Overview

--------------------------------------------------

Destination

Budget

Travel Style

Weather

--------------------------------------------------

Day-wise Timeline

--------------------------------------------------

Day 1

Day 2

Day 3

--------------------------------------------------

Budget Breakdown

--------------------------------------------------

Hotel

Food

Transport

Activities

--------------------------------------------------

Places to Visit

--------------------------------------------------

Popular

Hidden Gems

Nearby Attractions

--------------------------------------------------

Food Guide

--------------------------------------------------

Street Food

Restaurants

Desserts

--------------------------------------------------

Packing List

--------------------------------------------------

Essentials

Clothing

Electronics

Documents

--------------------------------------------------

Safety & Cultural Tips

--------------------------------------------------

Emergency Numbers

Scam Alerts

Local Etiquette

--------------------------------------------------

```

---

# AI Prompt Workflow

A **single, carefully engineered prompt** asks the AI to return structured JSON containing:

* Trip overview

* Destination summary

* Day-wise itinerary

* Budget allocation

* Transportation plan

* Accommodation suggestions

* Places to visit

* Hidden gems

* Food recommendations

* Restaurant suggestions

* Packing list

* Weather-based advice

* Safety tips

* Cultural etiquette

* Nearby attractions

* Travel checklist

* Alternative plans

* Souvenir suggestions

* Daily cost estimates

The frontend renders this JSON into interactive cards, timelines, maps, and checklists—eliminating the need for a database while still providing a rich, personalized travel planning experience. these are the final features , stress upon these for sure: Absolutely! I went through all three pages and organized the handwritten layout into a clean, structured specification while keeping the same numbering and intent from your notes.

✈️ AI Travel Planner — Final Webpage Layout

1) Sign In / Sign Up Page

Authentication

User Sign In / Sign Up

Authentication using Supabase

User authentication via email

Main branding/title:

AI Travel Planner

Simple, clean authentication screen.

2) Main Dashboard

The main dashboard is the user's primary travel-discovery page.

Top Section

Search bar

Search for destinations/places

Specifically intended for the Indian region

Weather information

Weather API integration

Display current temperature/weather for the selected location

Destination / Place Cards

Each place card should contain:

Place name

Rating

Basic information

Possibly image/visual

Reviews

Reviews

Display ratings

Show top reviews

Highlight:

Must-try places

Safety tips

Useful traveler recommendations

Recommended Section

Recommended for you

Recommendations personalized according to:

User preferences

Weather

Travel history/preferences

AI analysis

Weather-Based AI Recommendation

AI should consider the weather and recommend accordingly.

For example:

☀️ Weather is pleasant in Jaipur today → Recommended for sightseeing.

or

🌧️ Rain expected → Indoor attractions recommended.

3) User Review Dashboard

A dedicated page where users can contribute their own travel experiences.

Review Form

User selects a Place and can upload:

📷 Photos

🎥 Videos

✍️ Text review

Publish

A Publish button submits the review.

Review Content

Users can write reviews/recommendations about:

Places

Food

Hotels

Transport

Additional Features

Rating / Star rating

Share location/directions

Integrate with Map API

Published reviews should appear on the relevant place's page/dashboard.

Example

Delhi

⭐⭐⭐⭐⭐

Great place to visit! Must try the local food...

📍 Share Location

[Publish]

4) Places + Itinerary Page

This page displays detailed information about a selected destination and allows the user to generate a personalized itinerary.

Destination Header

Example:

Delhi

Information Displayed

Place information

User reviews

Published data/reviews

Ratings

Relevant travel information

Generate Itinerary Button

A prominent:

[Generate Itinerary]

button.

Clicking this opens the itinerary-generation form.

5) Generate Itinerary — Pop-up Form

When the user clicks Generate Itinerary, a popup/modal appears.

The purpose of this form is to understand the user's travel preferences before the AI generates the itinerary.

Form Inputs

1. Budget

Example:

₹15,000

₹30,000

₹50,000

Custom budget

A budget slider can also be used.

2. Transportation

User selects preferred transportation:

🚗 Car

🚆 Train

✈️ Flight

🚌 Bus

etc.

3. Number of People

Solo

2 people

3–5

5+

Custom number

4. Safety Preference

User specifies their safety requirements/preferences.

5. Food Preference

Examples:

Vegetarian

Non-vegetarian

Vegan

Jain

Local cuisine

etc.

6. Pet Friendly

Yes / No

Useful for travelers travelling with pets.

7. Adventure / Activity Preference

Examples:

Adventure

Relaxation

Sightseeing

Shopping

Nature

Culture

etc.

8. Festival / Party / Music Preference

User can indicate interest in:

Festivals

Parties

Music events

Local cultural events

etc.

Generate Button

At the bottom:

[Generate Itinerary]

This sends all preferences to the AI.

6) Itinerary Page

This is the AI-generated personalized travel plan.

AI Inputs

The AI uses:

Google Maps API

Places

Locations

Routes

Distance

Directions

Weather API

Current weather

Forecast

Weather suitability

WhatsApp / Research

Used as an additional research/input source according to your notes

Gemini

Used for AI generation

Personalization

Recommendations

Itinerary generation

Generated Itinerary

For example:

Delhi — 3 Days

Day 1

Must Visit

Tourist Spots

Food

Transport

Travel Checklist

Budget

Weather

Day 2

Same structure, optimized according to the user's preferences.

Day 3

Same structure.

Itinerary should include:

📍 Must-visit tourist spots

🍴 Food recommendations

🚗 Transportation

🎒 Travel checklist

💰 Estimated budget

🌤️ Weather information

🗺️ Routes / directions

⏰ Suggested timing

⭐ Recommended places

🤖 Weather-Aware AI Feature

One of the important differentiating features:

If the weather is suitable for visiting a particular place, the application should show a notification such as:

☀️ Great weather to visit!
This destination is popular and highly recommended during this season.

If weather conditions aren't suitable:

🌧️ Weather Alert
Rain is expected today. We recommend visiting indoor attractions instead.

So the AI doesn't simply generate a static itinerary—it adapts recommendations based on weather.

7) Deployment

Backend

Render

Frontend

Vercel

Seamless Deployment / App Distribution

Your notes also mention:

Deploy on Google Play Store for interoperability.

For a web application, the initial deployment can therefore be:

Frontend → Vercel
Backend → Render


If you later convert the application into a mobile app/PWA, it can be packaged for the Google Play Store.

🔄 Overall User Flow

                    AI TRAVEL PLANNER
                           │
                           ▼
                  ┌─────────────────┐
                  │ Sign In / Sign Up│
                  │    (Supabase)    │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Main Dashboard  │
                  │                 │
                  │ Search          │
                  │ Weather         │
                  │ Places          │
                  │ Reviews         │
                  │ Recommendations │
                  └───────┬─────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
      ┌───────────────┐       ┌────────────────┐
      │ Review Page   │       │ Places +       │
      │               │       │ Itinerary Page │
      │ Photos        │       │                │
      │ Videos        │       │ Place Details  │
      │ Text          │       │ Reviews        │
      │ Rating        │       │ Rating         │
      │ Location      │       │                │
      └───────────────┘       │ Generate       │
                              │ Itinerary      │
                              └───────┬────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │ Itinerary Popup  │
                            │                  │
                            │ Budget           │
                            │ Transport        │
                            │ People           │
                            │ Safety           │
                            │ Food             │
                            │ Pet Friendly     │
                            │ Activities       │
                            │ Festival/Music   │
                            └────────┬─────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   AI ITINERARY   │
                            │                  │
                            │ Google Maps API  │
                            │ Weather API      │
                            │ Gemini           │
                            │ Research         │
                            └────────┬─────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │ Personalized     │
                            │ Travel Plan      │
                            │                  │
                            │ Day 1            │
                            │ Day 2            │
                            │ Day 3 ...        │
                            └──────────────────┘


Core pages, therefore:

#PageMain Purpose1Sign In / Sign UpSupabase authentication2Main DashboardSearch, weather, places, reviews & recommendations3User Review DashboardUser-generated reviews, photos, videos & ratings4Places + ItineraryDestination details + itinerary generation5Generate Itinerary PopupCollect travel preferences6AI ItineraryDisplay personalized day-wise travel plan7DeploymentVercel + Render (+ future Play Store)

This gives you a pretty clear final UI/page hierarchy to hand directly to the frontend team before implementation.   apart from the forntend, the backend looks like this (just for reference) so leave enedpooints accdoringly and do tell in the chat as well, where is the end point and stuff. i want u to create only the frontend folder, backend folder is with us. so inform us accodringly. Maine backend me Trip ka CRUD setup kiya hai.

Supabase database connect kiya hai aur trips table banayi hai.

Trip create, get/history, update aur delete kar sakte hain.

/trip/generate endpoint bhi banaya hai jo frontend se destination, budget, days, people, transport, food preference, travel style aur interests receive karta hai.

Abhi AI generation usme connect nahi hai.

Frontend se bas ye APIs call karni hongi.I have made the backend for the AI travel planner.

The frontend will send me the destination, budget, and number of days.

My backend sends this information to Gemini AI, and Gemini generates the complete travel plan.

The backend then sends the result back to the frontend as JSON.

The response includes:

🗓️ Day-wise itinerary

📍 Places to visit

🍴 Must-try food

🎒 Packing list

✅ Travel checklist

💰 Budget allocation

🚗 Transportation plan

🛡️ Safety tips

🌍 Cultural etiquette

💵 Daily cost estimate

I also added a PDF generation API, so the frontend can have a Download PDF button.[7:12 pm, 09/08/2026] +91 98111 27711: I have added crud operations in a branch

Now how to work on the api?

[7:18 pm, 09/08/2026] +91 98111 27711: {

  "destination": "Goa",

  "budget": 30000,

  "days": 4,

  "people": 2,

  "transport": "Car",

  "food_preference": "Vegetarian",

  "travel_style": "Adventure",

  "interests": ["Beach", "Photography"]

}

[7:18 pm, 09/08/2026] +91 98111 27711: {

  "destination": "Goa",

  "budget": 30000,

  "days": 4,

  "people": 2,

  "transport": "Car",

  "food_preference": "Vegetarian",

  "travel_style": "Adventure",

  "interests": ["Beach", "Photography"]

}

/trip/generate endpoint ye input receive kar raha hai. Gemini service ko isi input ke saath compatible rakhna h. AI ka output structured JSON me, not plain text.

[7:19 pm, 09/08/2026] +91 98111 27711: AI output ideally:

{

  "overview": {},

  "itinerary": [],

  "places": [],

  "packing_list": [],

  "travel_checklist": [],

  "budget_breakdown": {},

  "transport_plan": [],

  "must_try_food": [],

  "safety_tips": [],

  "cultural_etiquette": [],

  "daily_costs". make good professional ui . thanks

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/70a7292c-fbfd-4f22-8e87-70ff190e53c7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
