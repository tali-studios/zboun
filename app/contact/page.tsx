import { SiteHeader } from "@/components/site-header";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="container py-14">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Contact us</h1>
          <p className="mt-2 text-slate-600">
            Tell us about your restaurant and we will get your ordering page live quickly.
          </p>
          <form className="mt-6 space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-green-500 focus:ring-2"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-green-500 focus:ring-2"
              required
            />
            <textarea
              name="message"
              placeholder="Message"
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-green-500 focus:ring-2"
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
            >
              Send message
            </button>
          </form>
          <p className="mt-5 text-sm text-slate-700">
            Contact number: <span className="font-semibold">+961 71 212 734</span>
          </p>
          <a
            href="https://wa.me/96171212734"
            className="mt-3 inline-flex rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
          >
            Chat on WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
