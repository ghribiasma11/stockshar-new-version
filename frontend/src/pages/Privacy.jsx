export default function Privacy() {
  const sections = [
    {
      title: '1. Data we collect',
      body: 'We collect the information you provide when creating an account: name, email, organization, city, phone, and profile photo.'
    },
    {
      title: '2. How we use it',
      body: 'We use your data to operate the marketplace, connect emitters and receivers, and send the newsletter you opt into.'
    },
    {
      title: '3. Sharing',
      body: 'When you publish a lot or reserve one, the other party sees the contact details needed to complete the hand-off. We do not sell your data.'
    },
    {
      title: '4. Retention and deletion',
      body: 'You can deactivate your account at any time, or delete it permanently from Account settings. Deletion removes your profile and your published lots.'
    },
    {
      title: '5. Cookies',
      body: 'We store a session token in your browser so you stay signed in.'
    },
    {
      title: '6. Contact',
      body: 'For privacy questions, use the contact form on the home page.'
    }
  ];

  return (
    <section className="section">
      <div className="section-inner section split">
        <div>
          <p className="eyebrow">Legal</p>
          <h2>Privacy Policy</h2>
          <p>Last updated: September 2026.</p>
        </div>
        <div>
          {sections.map((item) => (
            <div key={item.title}>
              <h3 style={{ fontSize: 20 }}>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
