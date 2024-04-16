
function getRandomStatus() {
    const status = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
    return pickRandomElement(status);
}

function getRandomAnimalName() {
    const names = ['Buddy', 'Molly', 'Max', 'Lucy', 'Daisy', 'Charlie', 'Sadie', 'Bella', 'Rocky', 'Maggie', 'Bailey', 'Sophie', 'Duke', 'Chloe', 'Bear', 'Lola', 'Tucker', 'Zoe', 'Jack', 'Luna', 'Cooper', 'Penny', 'Oliver', 'Stella', 'Riley', 'Gracie', 'Harley', 'Roxy', 'Murphy', 'Coco', 'Jake', 'Lily', 'Toby', 'Mia', 'Buster', 'Ruby', 'Dexter', 'Rosie', 'Winston', 'Ellie', 'Teddy', 'Zoey', 'Sam', 'Layla', 'Oscar', 'Pepper', 'Sammy', 'Lexi', 'Gus', 'Abby', 'Loki', 'Nala', 'Henry', 'Sasha', 'Zeus', 'Maya', 'Rusty', 'Maddie', 'Scout', 'Mocha', 'Chance', 'Emma', 'George', 'Harper', 'Marley', 'Minnie', 'Rex', 'Izzy', 'Boomer', 'Piper', 'Otis', 'Angel', 'Bandit', 'Phoebe', 'Rocco', 'Honey', 'Ranger', 'Sandy', 'Romeo', 'Mimi', 'Joey', 'Kona', 'Hank', 'Mika', 'Blue', 'Millie', 'Finn', 'Holly', 'Bruno', 'Misty', 'Jax', 'Macy', 'Ace', 'Sassy', 'Shadow', 'Sugar', 'Bentley', 'Sage', 'Chico', 'Mocha', 'Chase', 'Mimi', 'Rudy', 'Mocha'];
    return pickRandomElement(names);
}

function getRandomDateLastYear() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
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
for (let i = 0; i < 100; i++) {
    const id = crypto.randomUUID();
    const name = getRandomAnimalName();
    const type = Math.random() > 0.5 ? 'Dog' : 'Cat';
    const breed = type === 'Dog' ? 'Husky' : 'Siamese';
    const date = getRandomDateLastYear();
    const gender = pickRandomElement(['0', '1']);
    const public = pickRandomElement(['true', 'false']);
    const status = getRandomStatus();

    rows.push(`('${id}', '07f0711f-b952-4f02-9e85-f90a2a69b0e1', '${name}', '${date}', '${type}', '${breed}', ${gender}, ${public}, ${status}, false, false, false, false)`);
}
console.log(`INSERT INTO public."animal" (id, tenantId, name, dateOfAdmission, type, breedOne, sex, isPublic, status, donationCall, isMissing, isSuccessStory, isPrivateAdoption) VALUES ${rows.join(', ')};`)
