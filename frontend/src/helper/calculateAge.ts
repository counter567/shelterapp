function calculateAge(birthdate: Date) {
  const now = new Date();
  let years = now.getFullYear() - birthdate.getFullYear();
  let months = now.getMonth() - birthdate.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < birthdate.getDate())) {
    years--;
    months += 12;
  }

  return { years, months };
}

export { calculateAge };
