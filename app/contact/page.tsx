import { ContactWhatsAppForm } from "@/components/contact-whatsapp-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
          <ContactWhatsAppForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
