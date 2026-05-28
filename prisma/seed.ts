import { PrismaClient, Gender, Size, Species } from '@prisma/client';

const prisma = new PrismaClient();

const VENUES = [
  // Bangalore
  { name: 'Cubbon Park', city: 'Bangalore', address: 'Kasturba Rd, Bengaluru', category: 'park' },
  { name: 'Lalbagh Botanical Garden', city: 'Bangalore', address: 'Mavalli, Bengaluru', category: 'park' },
  { name: 'Doggy Dabba Cafe', city: 'Bangalore', address: 'Indiranagar, Bengaluru', category: 'cafe' },
  { name: 'Bangalore Pet Park', city: 'Bangalore', address: 'Hennur Rd, Bengaluru', category: 'park' },
  { name: 'The Pet Cafe', city: 'Bangalore', address: 'Koramangala, Bengaluru', category: 'cafe' },

  // Mumbai
  { name: 'Joggers Park', city: 'Mumbai', address: 'Bandra West, Mumbai', category: 'park' },
  { name: 'Carter Road Promenade', city: 'Mumbai', address: 'Bandra West, Mumbai', category: 'park' },
  { name: 'Bombay Canine Club', city: 'Mumbai', address: 'Worli, Mumbai', category: 'cafe' },
  { name: 'Shivaji Park', city: 'Mumbai', address: 'Dadar West, Mumbai', category: 'park' },
  { name: 'Pawfect Cafe', city: 'Mumbai', address: 'Andheri West, Mumbai', category: 'cafe' },

  // Delhi
  { name: 'Lodhi Gardens', city: 'Delhi', address: 'Lodhi Rd, New Delhi', category: 'park' },
  { name: 'Nehru Park', city: 'Delhi', address: 'Chanakyapuri, New Delhi', category: 'park' },
  { name: 'Puppychino Cafe', city: 'Delhi', address: 'Hauz Khas, New Delhi', category: 'cafe' },
  { name: 'Sunder Nursery', city: 'Delhi', address: 'Nizamuddin, New Delhi', category: 'park' },
  { name: 'Barking Deer', city: 'Delhi', address: 'GK 2, New Delhi', category: 'cafe' },
];

type PetSeed = {
  name: string;
  breed: string;
  age: number;
  gender: Gender;
  size: Size;
  temperament: string[];
  bio: string;
};

const PETS_PER_CITY: Record<string, PetSeed[]> = {
  Bangalore: [
    { name: 'Bruno', breed: 'Golden Retriever', age: 3, gender: Gender.MALE, size: Size.LARGE, temperament: ['friendly', 'playful'], bio: 'Loves long walks and tennis balls.' },
    { name: 'Luna', breed: 'Labrador', age: 2, gender: Gender.FEMALE, size: Size.LARGE, temperament: ['gentle', 'social'], bio: 'Sweet girl, great with other dogs.' },
    { name: 'Max', breed: 'Beagle', age: 4, gender: Gender.MALE, size: Size.MEDIUM, temperament: ['curious', 'energetic'], bio: 'Will follow any scent. Loves treats.' },
    { name: 'Daisy', breed: 'Pomeranian', age: 1, gender: Gender.FEMALE, size: Size.SMALL, temperament: ['playful', 'cuddly'], bio: 'Tiny but mighty.' },
    { name: 'Rocky', breed: 'German Shepherd', age: 5, gender: Gender.MALE, size: Size.LARGE, temperament: ['loyal', 'alert'], bio: 'Best boy. Loves park runs.' },
    { name: 'Bella', breed: 'Cocker Spaniel', age: 2, gender: Gender.FEMALE, size: Size.MEDIUM, temperament: ['friendly', 'gentle'], bio: 'Looking for playdate friends.' },
    { name: 'Charlie', breed: 'Indie', age: 3, gender: Gender.MALE, size: Size.MEDIUM, temperament: ['chill', 'friendly'], bio: 'Rescue pup with a big heart.' },
    { name: 'Coco', breed: 'Shih Tzu', age: 4, gender: Gender.FEMALE, size: Size.SMALL, temperament: ['playful', 'social'], bio: 'Looks fluffy because she is.' },
    { name: 'Zoey', breed: 'Dachshund', age: 2, gender: Gender.FEMALE, size: Size.SMALL, temperament: ['curious', 'cuddly'], bio: 'Loves sunbeams and ear scratches.' },
    { name: 'Toby', breed: 'Pug', age: 5, gender: Gender.MALE, size: Size.SMALL, temperament: ['chill', 'social'], bio: 'Snores loudly. No regrets.' },
  ],
  Mumbai: [
    { name: 'Simba', breed: 'Golden Retriever', age: 4, gender: Gender.MALE, size: Size.LARGE, temperament: ['friendly', 'playful'], bio: 'King of the Bandstand promenade.' },
    { name: 'Kiara', breed: 'Husky', age: 2, gender: Gender.FEMALE, size: Size.LARGE, temperament: ['energetic', 'social'], bio: 'AC required, hooman optional.' },
    { name: 'Oreo', breed: 'Dalmatian', age: 3, gender: Gender.MALE, size: Size.LARGE, temperament: ['playful', 'curious'], bio: 'Spots on point. Energy unmatched.' },
    { name: 'Mishti', breed: 'Indie', age: 1, gender: Gender.FEMALE, size: Size.MEDIUM, temperament: ['shy', 'gentle'], bio: 'Slow to warm up, fierce when she does.' },
    { name: 'Buddy', breed: 'Boxer', age: 4, gender: Gender.MALE, size: Size.LARGE, temperament: ['playful', 'loyal'], bio: 'Always ready for a wrestle.' },
    { name: 'Pixie', breed: 'Maltese', age: 2, gender: Gender.FEMALE, size: Size.SMALL, temperament: ['cuddly', 'gentle'], bio: 'Tiny diva who loves Marine Drive walks.' },
    { name: 'Rex', breed: 'Rottweiler', age: 5, gender: Gender.MALE, size: Size.LARGE, temperament: ['loyal', 'chill'], bio: 'Looks tough, is a softie.' },
    { name: 'Mochi', breed: 'Chow Chow', age: 3, gender: Gender.FEMALE, size: Size.MEDIUM, temperament: ['chill', 'social'], bio: 'Floof level: maximum.' },
    { name: 'Nova', breed: 'Border Collie', age: 2, gender: Gender.FEMALE, size: Size.MEDIUM, temperament: ['energetic', 'curious'], bio: 'Will herd anything that moves.' },
    { name: 'Leo', breed: 'Beagle', age: 3, gender: Gender.MALE, size: Size.MEDIUM, temperament: ['friendly', 'playful'], bio: 'Snack motivated. Always.' },
  ],
  Delhi: [
    { name: 'Shadow', breed: 'Labrador', age: 4, gender: Gender.MALE, size: Size.LARGE, temperament: ['loyal', 'gentle'], bio: 'Follows me everywhere.' },
    { name: 'Pearl', breed: 'Bichon Frise', age: 2, gender: Gender.FEMALE, size: Size.SMALL, temperament: ['playful', 'cuddly'], bio: 'White cloud with attitude.' },
    { name: 'Tiger', breed: 'Indie', age: 3, gender: Gender.MALE, size: Size.MEDIUM, temperament: ['alert', 'friendly'], bio: 'Streetwise and sweet.' },
    { name: 'Honey', breed: 'Cocker Spaniel', age: 1, gender: Gender.FEMALE, size: Size.MEDIUM, temperament: ['gentle', 'social'], bio: 'Pure sunshine.' },
    { name: 'Bagheera', breed: 'Black Lab', age: 5, gender: Gender.MALE, size: Size.LARGE, temperament: ['loyal', 'chill'], bio: 'My shadow at Lodhi Gardens.' },
    { name: 'Misty', breed: 'Pomeranian', age: 2, gender: Gender.FEMALE, size: Size.SMALL, temperament: ['playful', 'curious'], bio: 'Loud opinions, small body.' },
    { name: 'Hunter', breed: 'German Shepherd', age: 4, gender: Gender.MALE, size: Size.LARGE, temperament: ['alert', 'loyal'], bio: 'Looking for running buddies.' },
    { name: 'Jasmine', breed: 'Saluki', age: 3, gender: Gender.FEMALE, size: Size.LARGE, temperament: ['gentle', 'chill'], bio: 'Elegant and aloof, mostly.' },
    { name: 'Brownie', breed: 'Indie', age: 2, gender: Gender.MALE, size: Size.MEDIUM, temperament: ['friendly', 'social'], bio: 'Loves chai biscuit crumbs.' },
    { name: 'Snow', breed: 'Samoyed', age: 4, gender: Gender.FEMALE, size: Size.LARGE, temperament: ['cuddly', 'social'], bio: 'Smiles for treats.' },
  ],
};

type EventSeed = {
  name: string;
  location: string;
  details: string;
  description: string;
  daysFromNow: number;
};

// `details` is everything *except* the date — the date comes from startsAt
// (rendered via formatEventDate) so there's a single source of truth.
const EVENTS_PER_CITY: Record<string, EventSeed[]> = {
  Bangalore: [
    {
      name: 'Pawty in the Park',
      location: 'Cubbon Park, Kasturba Rd',
      details: '9–11 AM • Free • All breeds',
      description: 'Our flagship weekend meetup. Bring your dog, bring treats. Expect lots of zoomies, group photos by the bandstand, and a small obstacle course set up by the volunteer crew.',
      daysFromNow: 3,
    },
    {
      name: 'Doggy Dabba Brunch',
      location: 'Doggy Dabba Cafe, Indiranagar',
      details: '10 AM–1 PM • ₹400/pair',
      description: 'A relaxed brunch at the cafe with a dedicated playpen out back. Menu includes a pup-friendly platter (peanut butter biscuits, watermelon, frozen yogurt) and a full human menu.',
      daysFromNow: 4,
    },
    {
      name: 'Lalbagh Sunrise Walk',
      location: 'Lalbagh Botanical Garden, Mavalli',
      details: '6:30 AM • Free • Small/medium dogs',
      description: 'Beat the heat. Slow group walk on the inner loop trail with a coffee stop at the East Gate. Best for chill dogs who like to sniff.',
      daysFromNow: 6,
    },
    {
      name: 'Pet Adoption Drive',
      location: 'Bangalore Pet Park, Hennur Rd',
      details: '4–7 PM • Free entry',
      description: 'CUPA and Charlie\'s Animal Rescue Centre will be on-site with adoptable dogs. Your dog gets a playdate, you might find your next family member.',
      daysFromNow: 10,
    },
  ],
  Mumbai: [
    {
      name: 'Carter Road Sundowner',
      location: 'Carter Road Promenade, Bandra West',
      details: '5–7 PM • Free',
      description: 'Sunset stroll with the crew along the promenade. Lots of people, lots of joggers, lots of vada pav stands. Bring a leash and a poop bag.',
      daysFromNow: 2,
    },
    {
      name: 'Joggers Park Doggy Hour',
      location: 'Joggers Park, Bandra West',
      details: '7–9 AM • ₹100/dog',
      description: 'Off-leash hour in the fenced upper section. Small/medium dogs only. Booking via the park office at the gate.',
      daysFromNow: 5,
    },
    {
      name: 'Pawfect Cafe Mixer',
      location: 'Pawfect Cafe, Andheri West',
      details: '7–10 PM • ₹600/pair',
      description: 'Evening mixer with a pup-friendly menu and a quiet zone for shy dogs. Live acoustic set from 8 PM. Limit 20 dogs — RSVP early.',
      daysFromNow: 8,
    },
  ],
  Delhi: [
    {
      name: 'Lodhi Gardens Group Walk',
      location: 'Lodhi Gardens, Lodhi Rd',
      details: '7–9 AM • Free',
      description: 'The original Delhi pup meetup. Loop the gardens twice, swap tips, end at the cafe near Gate 3 for chai.',
      daysFromNow: 3,
    },
    {
      name: 'Sunder Nursery Playdate',
      location: 'Sunder Nursery, Nizamuddin',
      details: '8–10 AM • ₹50 entry',
      description: 'Spacious lawns and shaded paths. Great for off-leash play in the fenced central area. Volunteers will set up water stations.',
      daysFromNow: 6,
    },
    {
      name: 'Puppychino Hangout',
      location: 'Puppychino Cafe, Hauz Khas',
      details: '4–7 PM • ₹300/pair',
      description: 'Cafe meetup with house-made dog ice cream (puppychinos!) and a kids-and-dogs craft corner. Indoor + courtyard seating.',
      daysFromNow: 9,
    },
    {
      name: 'Nehru Park Bark Run',
      location: 'Nehru Park, Chanakyapuri',
      details: '6 AM • ₹200/pair',
      description: '5K run/walk with your dog. Routes for all paces. Finisher medals (bandanas for dogs). All proceeds go to Friendicoes shelter.',
      daysFromNow: 12,
    },
  ],
};

async function main() {
  console.log('Clearing existing data...');
  await prisma.eventAttendee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.message.deleteMany();
  await prisma.meetup.deleteMany();
  await prisma.match.deleteMany();
  await prisma.like.deleteMany();
  await prisma.block.deleteMany();
  await prisma.report.deleteMany();
  await prisma.petPhoto.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.venue.deleteMany();

  console.log('Seeding venues...');
  await prisma.venue.createMany({ data: VENUES });

  console.log('Seeding demo users and pets...');
  const usersByCity: Record<string, string[]> = {};
  let userIndex = 0;
  let petIndex = 0;
  for (const [city, pets] of Object.entries(PETS_PER_CITY)) {
    usersByCity[city] = [];
    for (const pet of pets) {
      const phoneTail = String(userIndex).padStart(3, '0');
      const phone = `+91900000${phoneTail}`;
      const user = await prisma.user.create({
        data: {
          phone,
          name: `${pet.name}'s Human`,
          city,
          bio: 'Loves dogs and chai.',
        },
      });
      usersByCity[city].push(user.id);
      await prisma.pet.create({
        data: {
          ownerId: user.id,
          name: pet.name,
          species: Species.DOG,
          breed: pet.breed,
          age: pet.age,
          gender: pet.gender,
          size: pet.size,
          temperament: pet.temperament,
          bio: pet.bio,
          vaccinated: true,
          photos: {
            create: [
              { url: `https://placedog.net/640/640?id=${petIndex + 10}`, order: 0 },
              { url: `https://placedog.net/640/640?id=${petIndex + 50}`, order: 1 },
            ],
          },
        },
      });
      userIndex++;
      petIndex++;
    }
  }

  console.log('Seeding events and pre-RSVPs...');
  const now = Date.now();
  let totalEvents = 0;
  let totalRsvps = 0;
  for (const [city, events] of Object.entries(EVENTS_PER_CITY)) {
    const cityUserIds = usersByCity[city] ?? [];
    for (let e = 0; e < events.length; e++) {
      const ev = events[e];
      const event = await prisma.event.create({
        data: {
          name: ev.name,
          city,
          location: ev.location,
          details: ev.details,
          description: ev.description,
          startsAt: new Date(now + ev.daysFromNow * 24 * 60 * 60 * 1000),
        },
      });
      totalEvents++;
      // Pre-RSVP ~half of this city's users to each event, offset so they're not all on the same one.
      // This guarantees that any seeded pet a tester matches with is attending at least 1 event.
      const half = Math.ceil(cityUserIds.length / 2);
      const offset = e * 2;
      const attendees = Array.from({ length: half }, (_, i) => cityUserIds[(offset + i) % cityUserIds.length]);
      const unique = Array.from(new Set(attendees));
      for (const uid of unique) {
        await prisma.eventAttendee.create({ data: { eventId: event.id, userId: uid } });
        totalRsvps++;
      }
    }
  }

  const totalPets = Object.values(PETS_PER_CITY).reduce((n, arr) => n + arr.length, 0);
  console.log(`Seeded ${VENUES.length} venues, ${totalPets} demo users, ${totalEvents} events, ${totalRsvps} pre-RSVPs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
