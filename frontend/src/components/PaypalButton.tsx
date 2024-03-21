interface PayPalButtonProps {
  name: string;
  className?: string;
}

const PayPalButton = ({ name, className }: PayPalButtonProps) => (
  <form
    action="https://www.paypal.com/cgi-bin/webscr"
    method="post"
    target="_blank"
    className={className}
  >
    <input type="hidden" name="cmd" value="_donations" />
    <input type="hidden" name="business" value="spenden@tierheim-neuwied.de" />
    <input type="hidden" name="item_name" value={name} />
    <input type="hidden" name="currency_code" value="EUR" />
    <input
      type="image"
      className="paypal-logo"
      src="/paypal-donation.svg"
      style={{ border: 0 }}
      name="submit"
      title="Jetzt mit PayPal für dieses Tier spenden"
      alt="Spenden mit dem PayPal-Button"
    />
  </form>
);

export default PayPalButton;
