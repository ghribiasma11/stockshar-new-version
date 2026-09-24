export default function Terms() {
  const sections = [
    {
      title: '1. Acceptance',
      body: 'By creating an account or using StockShare, you agree to these Terms of Use and to our Privacy Policy.'
    },
    {
      title: '2. The service',
      body: 'StockShare connects businesses that have surplus ingredients with receivers who redistribute them through human donation, animal feed, or industrial recycling.'
    },
    {
      title: '3. Accounts',
      body: 'You are responsible for the accuracy of your information and for keeping your password secure. You may deactivate or delete your account at any time from Account settings.'
    },
    {
      title: '4. Lots and reservations',
      body: 'Emitters publish lots and cannot reserve their own lots. Receivers may reserve available lots. Both parties are responsible for the safety and legality of the hand-off.'
    },
    {
      title: '5. Prohibited use',
      body: 'Do not publish unsafe, misdescribed, or illegal goods, and do not use StockShare to harm people, animals, or the environment.'
    },
    {
      title: '6. Liability',
      body: 'StockShare is provided as is. We are not liable for the condition of lots exchanged between users.'
    },
    {
      title: '7. Contact',
      body: 'Questions about these terms? Reach us through the contact form on the home page.'
    }
  ];

  return (
    <section className="section">
      <div className="section-inner section split">
        <div>
          <p className="eyebrow">Legal</p>
          <h2>Terms of Use</h2>
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
