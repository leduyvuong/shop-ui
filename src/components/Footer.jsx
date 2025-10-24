export default function Footer() {
  return (
    <footer className="bg-slate-900 py-10 text-slate-100 dark:bg-slate-950 dark:text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div>
          <h3 className="text-lg font-semibold">Modern Store</h3>
          <p className="mt-3 text-sm text-slate-300 dark:text-slate-400">
            Discover curated fashion, electronics, and jewelry with a seamless shopping experience designed for every device.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-300 dark:text-slate-400">
            <li>About</li>
            <li>Support</li>
            <li>Shipping</li>
            <li>Returns</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide">Stay Connected</h4>
          <p className="mt-3 text-sm text-slate-300 dark:text-slate-400">
            Follow us on social media for the latest drops and exclusive offers.
          </p>
          <div className="mt-4 flex gap-3">
            {['twitter', 'instagram', 'facebook'].map((network) => (
              <a
                key={network}
                href={`https://${network}.com`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/10 p-3 text-white transition hover:bg-primary dark:bg-white/5 dark:hover:bg-primary-light"
              >
                <span className="text-xs uppercase">{network}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-slate-500 dark:text-slate-500">
        © {new Date().getFullYear()} Modern Store. All rights reserved.
      </p>
    </footer>
  );
}
