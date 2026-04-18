import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader showForRestaurantsLink />
      <main className="container py-14">
        <div className="panel mx-auto max-w-2xl rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-slate-900">Contact us</h1>
          <p className="mt-2 text-slate-600">
            Tell us about your restaurant and we will get your ordering page live quickly.
          </p>
          <form className="mt-6 space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="ui-input"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              className="ui-input"
              required
            />
            <textarea
              name="message"
              placeholder="Message"
              rows={4}
              className="ui-textarea"
              required
            />
            <button
              type="submit"
              className="btn btn-success w-full rounded-xl py-3"
            >
              Send message
            </button>
          </form>
          <p className="mt-5 text-sm text-slate-700">
            Contact number: <span className="font-semibold">+961 71 212 734</span>
          </p>
          <a
            href="https://wa.me/96171212734"
            className="btn btn-primary mt-3"
          >
            Chat on WhatsApp
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
