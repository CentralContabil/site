import bcrypt from 'bcrypt';

async function testPassword() {
  const hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  const password = 'admin123';
  
  const isMatch = await bcrypt.compare(password, hash);
  console.log('Password match:', isMatch);
  
  // Also test if we can create the same hash
  const newHash = await bcrypt.hash(password, 10);
  console.log('New hash:', newHash);
}

testPassword();