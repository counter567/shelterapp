
function getRandomStatus() {
    const status = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
    return pickRandomElement(status);
}

function getRandomIllness() {
    const names = [
        'Feline Immunodeficiency Virus (FIV)',
        'Feline Leukemia Virus (FeLV)',
        'Feline Infectious Peritonitis (FIP)',
        'Feline Lower Urinary Tract Disease (FLUTD)',
        'Feline Diabetes',
        'Feline Hyperthyroidism',
        'Feline Kidney Disease',
        'Feline Asthma',
        'Feline Obesity',
        'Feline Dental Disease',
    ];
    const array = [];
    array.length = Math.floor(Math.random() * 3);
    for (let i = 0; i < array.length; i++) {
        array[i] = pickRandomElement(names);
    }
    return array;
}

function getRandomAllergies() {
    const names = [
        'Flea Allergy Dermatitis',
        'Food Allergies',
        'Inhalant Allergies',
        'Contact Allergies',
        'Bacterial Allergies',
        'Yeast Allergies',
        'Ear Mites',
        'Ringworm',
        'Ticks',
        'Fleas',
    ];
    const array = [];
    array.length = Math.floor(Math.random() * 3);
    for (let i = 0; i < array.length; i++) {
        array[i] = pickRandomElement(names);
    }
    return array;
}

function getRandomAnimalName() {
    const names = ['Buddy', 'Molly', 'Max', 'Lucy', 'Daisy', 'Charlie', 'Sadie', 'Bella', 'Rocky', 'Maggie', 'Bailey', 'Sophie', 'Duke', 'Chloe', 'Bear', 'Lola', 'Tucker', 'Zoe', 'Jack', 'Luna', 'Cooper', 'Penny', 'Oliver', 'Stella', 'Riley', 'Gracie', 'Harley', 'Roxy', 'Murphy', 'Coco', 'Jake', 'Lily', 'Toby', 'Mia', 'Buster', 'Ruby', 'Dexter', 'Rosie', 'Winston', 'Ellie', 'Teddy', 'Zoey', 'Sam', 'Layla', 'Oscar', 'Pepper', 'Sammy', 'Lexi', 'Gus', 'Abby', 'Loki', 'Nala', 'Henry', 'Sasha', 'Zeus', 'Maya', 'Rusty', 'Maddie', 'Scout', 'Mocha', 'Chance', 'Emma', 'George', 'Harper', 'Marley', 'Minnie', 'Rex', 'Izzy', 'Boomer', 'Piper', 'Otis', 'Angel', 'Bandit', 'Phoebe', 'Rocco', 'Honey', 'Ranger', 'Sandy', 'Romeo', 'Mimi', 'Joey', 'Kona', 'Hank', 'Mika', 'Blue', 'Millie', 'Finn', 'Holly', 'Bruno', 'Misty', 'Jax', 'Macy', 'Ace', 'Sassy', 'Shadow', 'Sugar', 'Bentley', 'Sage', 'Chico', 'Mocha', 'Chase', 'Mimi', 'Rudy', 'Mocha'];
    return pickRandomElement(names);
}

function getRandomDateBeforeYear(year) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - year);
    date.setMonth(Math.floor(Math.random() * 12));
    date.setDate(Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    date.setSeconds(Math.floor(Math.random() * 60));
    return date.toISOString();
}

function pickRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const rows = [];
const ill = [];
const all = [];
for (let i = 0; i < 50; i++) {
    const id = crypto.randomUUID();
    const name = getRandomAnimalName();
    const type = Math.random() > 0.5 ? 'Dog' : 'Cat';
    const breed = type === 'Dog' ? 'Husky' : 'Siamese';
    const breedtwo = type === 'Dog' ? 'Husky' : 'Siamese';
    const date = getRandomDateBeforeYear(1);
    const dateOfBirth = getRandomDateBeforeYear(3);
    const color = pickRandomElement(['Black', 'White', 'Brown', 'Grey', 'Orange', 'Yellow', 'Blue', 'Green', 'Red', 'Pink', 'Purple', 'Cyan', 'Magenta', 'Lime', 'Teal', 'Indigo', 'Maroon', 'Olive', 'Navy', 'Aquamarine', 'Turquoise', 'Silver', 'Lime', 'Fuchsia', 'Violet', 'Beige', 'Tan', 'Khaki', 'Crimson', 'Gold', 'Plum', 'Coral', 'Salmon', 'Mint', 'Lavender', 'Ivory', 'Azure', 'Cyan', 'Silver']);
    const gender = pickRandomElement(['0', '1']);
    const public = pickRandomElement(['true', 'false']);
    const donationCall = pickRandomElement(['true', 'false']);
    const isMissing = pickRandomElement(['true', 'false']);
    const isSuccessStory = pickRandomElement(['true', 'false']);
    const isPrivateAdoption = pickRandomElement(['true', 'false']);
    const isCastrated = pickRandomElement(['true', 'false']);
    const wasFound = pickRandomElement(['true', 'false']);
    const weight = Math.floor(Math.random() * 100);
    const heightAtWithers = Math.floor(Math.random() * 100);
    const circumferenceOfNeck = Math.floor(Math.random() * 100);
    const lengthOfBack = Math.floor(Math.random() * 100);
    const circumferenceOfChest = Math.floor(Math.random() * 100);
    const bloodType = pickRandomElement(['A', 'B', 'AB', '0']);
    const chipNumber = crypto.randomUUID();
    const status = getRandomStatus();
    const notes = 'Lorem ipsum dolor sit amet.';

    getRandomIllness().forEach(element => {
        ill.push(`( '${id}', '${element}' )`);
    });
    getRandomAllergies().forEach(element => {
        all.push(`( '${id}', '${element}' )`);
    });

    rows.push(`( '${id}', '07f0711f-b952-4f02-9e85-f90a2a69b0e1', '${name}', '${date}', '${type}', '${breed}', '${breedtwo}', ${gender}, ${public}, ${status}, ${donationCall}, ${isMissing}, ${isSuccessStory}, ${isPrivateAdoption}, ${isCastrated}, '${dateOfBirth}', '${color}', ${weight}, ${heightAtWithers}, ${circumferenceOfNeck}, ${lengthOfBack}, ${circumferenceOfChest}, '${bloodType}', '${chipNumber}', ${wasFound}, '${notes}', '${notes}', '${notes}' )`);
}
console.log(`INSERT INTO public."animal" (id, tenantId, name, dateOfAdmission, type, breedOne, breedTwo, sex, 
    isPublic, status, donationCall, isMissing, isSuccessStory, isPrivateAdoption, isCastrated, dateOfBirth, color, 
    weight, heightAtWithers, circumferenceOfNeck, lengthOfBack, circumferenceOfChest, bloodType, chipNumber, wasFound,
    notes, description, internalNotes
) VALUES ${rows.join(',\n')};
INSERT INTO public."animal_allergies" (animal_id, allergies) VALUES ${all.join(',\n')};
INSERT INTO public."animal_illnesses" (animal_id, illnesses) VALUES ${ill.join(',\n')};
`);
