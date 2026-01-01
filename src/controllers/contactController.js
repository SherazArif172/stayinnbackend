// Submit contact form
const submitContact = (req, res) => {
  const { name, email, message } = req.body;
  
  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // In a real app, you would save this to a database or send an email
  console.log('Contact form submission:', { name, email, message });
  
  res.json({ 
    success: true, 
    message: 'Thank you for contacting us. We will get back to you soon.' 
  });
};

export {
  submitContact,
};

