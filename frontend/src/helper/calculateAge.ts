function calculateAge(birthdate: Date) {
  const now = new Date();
  if (typeof birthdate === "string") birthdate = new Date(birthdate);
  let years = now.getFullYear() - birthdate.getFullYear();
  let months = now.getMonth() - birthdate.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < birthdate.getDate())) {
    years--;
    months += 12;
  }

  return { years, months };
}

export { calculateAge };
