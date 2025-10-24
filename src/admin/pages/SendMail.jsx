import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminContext } from '../context/AdminContext.jsx';

const segments = [
  {
    id: 'all',
    label: 'All Customers',
    description: 'Broadcast updates to everyone in your customer list.',
    suggestion: 'customers@newsletter.shop',
  },
  {
    id: 'vip',
    label: 'VIP Customers',
    description: 'Reward frequent shoppers with exclusive campaigns.',
    suggestion: 'vip@newsletter.shop',
  },
  {
    id: 'inactive',
    label: 'Inactive Customers',
    description: 'Re-engage shoppers who have not purchased recently.',
    suggestion: 'winback@newsletter.shop',
  },
];

const templates = [
  {
    id: 'new-arrivals',
    title: 'New Arrivals',
    preview: 'Highlight the latest products that just landed.',
    subject: 'Discover what is new in store ✨',
    message: 'Hi there! We have just added fresh arrivals to the store. Take a look at the curated selection and let us know what you think!',
  },
  {
    id: 'seasonal-sale',
    title: 'Seasonal Sale',
    preview: 'Drive urgency around a promotional event.',
    subject: 'Seasonal savings are here 🍂',
    message: 'Our seasonal sale is in full swing! Enjoy limited time discounts across the catalog before the event wraps up.',
  },
  {
    id: 'thank-you',
    title: 'Thank You',
    preview: 'Send appreciation to your loyal customers.',
    subject: 'Thank you for being with us 💛',
    message: 'We appreciate your continued support. Here is a small gift and a curated list of picks we think you will love.',
  },
];

const initialFormState = {
  to: '',
  subject: '',
  message: '',
};

export default function SendMail() {
  const { showToast } = useAdminContext();
  const [form, setForm] = useState(initialFormState);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [validationErrors, setValidationErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [scheduledEmails, setScheduledEmails] = useState([]);

  const suggestedRecipient = useMemo(() => {
    return segments.find((segment) => segment.id === selectedSegment)?.suggestion ?? '';
  }, [selectedSegment]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSegmentChange = (segmentId) => {
    setSelectedSegment(segmentId);
    setForm((previous) => ({ ...previous, to: segments.find((segment) => segment.id === segmentId)?.suggestion ?? previous.to }));
  };

  const handleTemplateSelect = (template) => {
    setForm((previous) => ({
      ...previous,
      subject: template.subject,
      message: template.message,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.to.trim()) {
      errors.to = 'Recipient is required.';
    }
    if (!form.subject.trim()) {
      errors.subject = 'Subject is required.';
    }
    if (!form.message.trim()) {
      errors.message = 'A message is required.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSending(true);
    window.setTimeout(() => {
      setScheduledEmails((previous) => [
        {
          id: Date.now(),
          to: form.to.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          scheduledFor: new Date().toLocaleString(),
        },
        ...previous,
      ]);
      setForm(initialFormState);
      setSending(false);
      showToast('Email scheduled successfully.');
    }, 650);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create campaign</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Send personalised updates to your customers.</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
              Segment: {segments.find((segment) => segment.id === selectedSegment)?.label}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="to" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Recipient
              </label>
              <input
                id="to"
                name="to"
                type="email"
                value={form.to}
                onChange={handleChange}
                placeholder={suggestedRecipient || 'customer@example.com'}
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:bg-slate-950 ${
                  validationErrors.to ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {validationErrors.to && <p className="mt-2 text-xs text-rose-500">{validationErrors.to}</p>}
            </div>

            <div>
              <label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="Share your latest update"
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:bg-slate-950 ${
                  validationErrors.subject ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {validationErrors.subject && <p className="mt-2 text-xs text-rose-500">{validationErrors.subject}</p>}
            </div>

            <div>
              <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="6"
                value={form.message}
                onChange={handleChange}
                placeholder="Write a warm message that resonates with your audience."
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:bg-slate-950 ${
                  validationErrors.message ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {validationErrors.message && <p className="mt-2 text-xs text-rose-500">{validationErrors.message}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Messages are queued and delivered via your default provider.
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {sending ? 'Scheduling…' : 'Schedule send'}
              </motion.button>
            </div>
          </form>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Audience segments</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose who should receive this message.</p>
            <div className="mt-4 space-y-3">
              {segments.map((segment) => {
                const isActive = selectedSegment === segment.id;
                return (
                  <button
                    key={segment.id}
                    type="button"
                    onClick={() => handleSegmentChange(segment.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition hover:border-indigo-400/70 hover:bg-indigo-50/40 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10 ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-200'
                        : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="text-sm font-medium">{segment.label}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{segment.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Templates</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Start with a proven format to move faster.</p>
            <div className="mt-4 space-y-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-600 transition hover:border-indigo-400/70 hover:bg-indigo-50/40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10"
                >
                  <p className="font-medium text-slate-800 dark:text-slate-100">{template.title}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{template.preview}</p>
                </button>
              ))}
            </div>
          </section>
        </motion.aside>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Scheduled messages</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Review upcoming sends for transparency.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {scheduledEmails.length} queued
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {scheduledEmails.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Scheduled messages will appear here once you queue them.
            </div>
          )}

          {scheduledEmails.map((email) => (
            <div
              key={email.id}
              className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">{email.subject}</p>
                <span className="text-xs text-slate-500 dark:text-slate-400">{email.scheduledFor}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">To: {email.to}</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{email.message}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
