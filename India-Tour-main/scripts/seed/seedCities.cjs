require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// cities schema: id (int), name text, state_id int, description text, image_url text, created_at, updated_at

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const cities = [
  {
    id: 1,
    name: 'Jabalpur',
    state_id: 1,
    description: 'A major city in Madhya Pradesh known for marble rocks and waterfalls.',
    image_url:
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 2,
    name: 'Bhopal',
    state_id: 1,
    description: 'Capital of Madhya Pradesh, famous for its lakes and heritage.',
    image_url:
      'https://images.unsplash.com/photo-1524492514791-505e3bfb9c51?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 3,
    name: 'Jaipur',
    state_id: 2,
    description: 'The Pink City, known for its palaces and forts.',
    image_url:
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 4,
    name: 'Udaipur',
    state_id: 2,
    description: 'City of lakes in Rajasthan with beautiful palaces.',
    image_url:
      'https://images.unsplash.com/photo-1603267165439-4822fb45fc53?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 5,
    name: 'Kochi',
    state_id: 3,
    description: 'A coastal city in Kerala with a rich trading history.',
    image_url:
      'https://images.unsplash.com/photo-1526835746352-0b9da4054862?w=800&h=600&fit=crop&crop=center'
  }
];

async function seedCities() {
  try {
    console.log('Starting to seed cities...');

    const { count, error: countError } = await supabase
      .from('cities')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking existing cities:', countError);
      return;
    }

    if ((count || 0) > 0) {
      console.log(`Cities table already has ${count} rows. Skipping seeding.`);
      return;
    }

    const { data, error } = await supabase
      .from('cities')
      .insert(cities)
      .select();

    if (error) {
      console.error('Error seeding cities:', error);
      return;
    }

    console.log('Successfully seeded cities:', data);
  } catch (error) {
    console.error('Unexpected error during cities seeding:', error);
  }
}

seedCities()
  .then(() => {
    console.log('Cities seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during cities seeding:', error);
    process.exit(1);
  });
