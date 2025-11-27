require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Seed data aligned with current states schema
// columns used: id (int), name, description, image_url
const indianStates = [
  {
    id: 1,
    name: 'Madhya Pradesh',
    description:
      'Central Indian state known for its rich history, wildlife reserves, and diverse landscapes.',
    image_url:
      'https://images.unsplash.com/photo-1580474295621-98a141d7e367?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 2,
    name: 'Rajasthan',
    description:
      'The Land of Kings, famous for its forts, palaces, desert landscapes, and vibrant culture.',
    image_url:
      'https://images.unsplash.com/photo-1599665762116-f806aeefe90c?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 3,
    name: 'Kerala',
    description:
      "God's Own Country, known for its backwaters, lush greenery, and Ayurvedic retreats.",
    image_url:
      'https://images.unsplash.com/photo-1506968430777-bf7784a87f23?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 4,
    name: 'Uttar Pradesh',
    description:
      'Home to the Taj Mahal and Varanasi, rich in cultural and historical significance.',
    image_url:
      'https://images.unsplash.com/photo-1583398406025-99616aa38c98?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 5,
    name: 'Maharashtra',
    description:
      'A diverse state with bustling cities, coastal regions, and hill stations.',
    image_url:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&crop=center'
  }
];

async function seedStates() {
  try {
    console.log('Starting to seed states...');
    
    // If table already has data, do nothing (avoid destructive operations)
    const { count, error: countError } = await supabase
      .from('states')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking existing states:', countError);
      return;
    }

    if ((count || 0) > 0) {
      console.log(`States table already has ${count} rows. Skipping seeding.`);
      return;
    }

    // Insert new states
    const { data, error } = await supabase
      .from('states')
      .insert(indianStates)
      .select();

    if (error) {
      console.error('Error seeding states:', error);
      return;
    }

    console.log('Successfully seeded states:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the seed function
seedStates().then(() => {
  console.log('Seeding completed');
  process.exit(0);
}).catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
});
