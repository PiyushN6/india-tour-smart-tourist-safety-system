require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// places schema: id int, name text, city_id int, state text, description text, image_url text, rating numeric, category text

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const places = [
  {
    id: 1,
    name: 'Bhedaghat Marble Rocks',
    city_id: 1,
    state: 'Madhya Pradesh',
    description: 'Dramatic marble cliffs along the Narmada River with boat rides.',
    image_url:
      'https://images.unsplash.com/photo-1526481280695-3c687fd543c0?w=800&h=600&fit=crop&crop=center',
    rating: 4.8,
    category: 'heritage'
  },
  {
    id: 2,
    name: 'Dhuandhar Falls',
    city_id: 1,
    state: 'Madhya Pradesh',
    description: 'Spectacular waterfall near Jabalpur, especially impressive during monsoon.',
    image_url:
      'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&h=600&fit=crop&crop=center',
    rating: 4.7,
    category: 'adventure'
  },
  {
    id: 3,
    name: 'Hawa Mahal',
    city_id: 3,
    state: 'Rajasthan',
    description: 'Iconic palace in Jaipur with intricate lattice windows.',
    image_url:
      'https://images.unsplash.com/photo-1599665762116-98a141d7e367?w=800&h=600&fit=crop&crop=center',
    rating: 4.6,
    category: 'heritage'
  },
  {
    id: 4,
    name: 'City Palace Udaipur',
    city_id: 4,
    state: 'Rajasthan',
    description: 'A grand palace complex overlooking Lake Pichola.',
    image_url:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&crop=center',
    rating: 4.7,
    category: 'heritage'
  },
  {
    id: 5,
    name: 'Fort Kochi Beach',
    city_id: 5,
    state: 'Kerala',
    description: 'Popular beach in Kochi with Chinese fishing nets and sunsets.',
    image_url:
      'https://images.unsplash.com/photo-1493550178081-2125c6848048?w=800&h=600&fit=crop&crop=center',
    rating: 4.3,
    category: 'beach'
  }
];

async function seedPlaces() {
  try {
    console.log('Starting to seed places...');

    const { count, error: countError } = await supabase
      .from('places')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking existing places:', countError);
      return;
    }

    if ((count || 0) > 0) {
      console.log(`Places table already has ${count} rows. Skipping seeding.`);
      return;
    }

    const { data, error } = await supabase
      .from('places')
      .insert(places)
      .select();

    if (error) {
      console.error('Error seeding places:', error);
      return;
    }

    console.log('Successfully seeded places:', data);
  } catch (error) {
    console.error('Unexpected error during places seeding:', error);
  }
}

seedPlaces()
  .then(() => {
    console.log('Places seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during places seeding:', error);
    process.exit(1);
  });
