import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";

export const metadata: Metadata = { title: "Razorpay Node" };

export default function RazorpayPage() {
  return (
    <>
      <Breadcrumb
        items={[{ label: "Nodes", href: "/docs/nodes" }, { label: "Razorpay" }]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Razorpay Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Manage orders, payments, refunds, subscriptions, invoices, payment
        links, and payouts via Razorpay API.
      </p>

      {/* Setup */}
      <h2 id="setup" className="mt-12 text-2xl font-bold">
        Setup
      </h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-foreground/80">
        <li>
          Go to <strong>dashboard.razorpay.com</strong>
        </li>
        <li>Settings → API Keys → Generate Key</li>
        <li>
          Copy Key ID (
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            rzp_live_xxx
          </code>{" "}
          or{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            rzp_test_xxx
          </code>
          )
        </li>
        <li>Copy Key Secret</li>
        <li>
          Add a <strong>RAZORPAY</strong> credential in Nodebase
        </li>
      </ol>

      <Callout type="warning">
        <strong>Important:</strong> All amounts in Razorpay are in the smallest
        currency unit (paise). ₹1 = 100 paise. ₹500 = 50,000 paise. Output
        includes <code className="font-mono">amountInRupees</code> for
        convenience.
      </Callout>

      {/* Operations */}
      <h2 id="operations" className="mt-12 text-2xl font-bold">
        Operations
      </h2>

      {/* Orders */}
      <h3 id="orders" className="mt-8 text-xl font-semibold">
        Orders
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        <strong>CREATE ORDER</strong> — create a new payment order.
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <strong>Required:</strong> Amount (paise), Currency (INR)
        </li>
        <li>
          <strong>Optional:</strong> Receipt, Notes, Allow Partial Payment
        </li>
      </ul>
      <p className="mt-2 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.orderId}}"}
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.amount}}"}
        </code>
      </p>
      <p className="mt-2 text-foreground/80">
        Also: <strong>FETCH ORDER</strong>,{" "}
        <strong>FETCH ORDER PAYMENTS</strong>, <strong>LIST ORDERS</strong>.
      </p>

      {/* Payments */}
      <h3 id="payments" className="mt-8 text-xl font-semibold">
        Payments
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        <strong>FETCH PAYMENT</strong>, <strong>CAPTURE PAYMENT</strong>,{" "}
        <strong>LIST PAYMENTS</strong>, <strong>UPDATE PAYMENT</strong>.
      </p>
      <Callout type="danger">
        When capturing a payment, the amount <strong>must match</strong> the
        original order amount.
      </Callout>

      {/* Refunds */}
      <h3 id="refunds" className="mt-8 text-xl font-semibold">
        Refunds
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        <strong>CREATE REFUND</strong> — refund a payment. Leave amount empty
        for a full refund. Speed: Normal (5-7 days) or Optimum (instant if
        possible).
      </p>
      <p className="mt-2 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.refundId}}"}
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.status}}"}
        </code>
      </p>

      {/* Payment Links */}
      <h3 id="payment-links" className="mt-8 text-xl font-semibold">
        Payment Links{" "}
        <span className="text-sm font-normal text-muted-foreground">
          (Most Popular)
        </span>
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        <strong>CREATE PAYMENT LINK</strong> — Required: Amount, Description,
        Customer details.
      </p>
      <p className="mt-2 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.shortUrl}}"}
        </code>{" "}
        — share this link with your customer.
      </p>
      <Callout type="tip">
        <strong>Example workflow:</strong> Webhook → Razorpay Create Payment
        Link → WhatsApp
        <br />
        <code className="font-mono text-sm">
          {'"Hi {{name}}, pay here: {{razorpay.shortUrl}}"'}
        </code>
      </Callout>
      <p className="mt-2 text-foreground/80">
        Also: <strong>FETCH</strong>, <strong>UPDATE</strong>,{" "}
        <strong>CANCEL PAYMENT LINK</strong>.
      </p>

      {/* Customers */}
      <h3 id="customers" className="mt-8 text-xl font-semibold">
        Customers
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        <strong>CREATE</strong>, <strong>FETCH</strong>,{" "}
        <strong>UPDATE CUSTOMER</strong>. Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.customerId}}"}
        </code>
      </p>

      {/* Subscriptions */}
      <h3 id="subscriptions" className="mt-8 text-xl font-semibold">
        Subscriptions
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        <strong>CREATE SUBSCRIPTION</strong> — recurring billing. Required: Plan
        ID, Total Count (billing cycles).
      </p>
      <p className="mt-2 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.subscriptionId}}"}
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.status}}"}
        </code>
      </p>

      {/* Invoices */}
      <h3 id="invoices" className="mt-8 text-xl font-semibold">
        Invoices
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        <strong>CREATE INVOICE</strong> — generate and send an invoice. Supports
        line items with quantity and tax.
      </p>
      <p className="mt-2 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.invoiceId}}"}
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.shortUrl}}"}
        </code>
      </p>

      {/* Payouts */}
      <h3 id="payouts" className="mt-8 text-xl font-semibold">
        Payouts (Razorpay X)
      </h3>
      <p className="mt-2 leading-relaxed text-foreground/80">
        <strong>CREATE PAYOUT</strong> — send money to a bank account or UPI.
        Required: Account Number, Fund Account ID, Amount, Mode.
      </p>
      <p className="mt-2 text-sm text-foreground/80">
        Modes: <strong>NEFT</strong> | <strong>RTGS</strong> |{" "}
        <strong>IMPS</strong> | <strong>UPI</strong>
      </p>
      <p className="mt-2 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.payoutId}}"}
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.utr}}"}
        </code>
      </p>

      {/* Verify Signature */}
      <h2 id="verify-signature" className="mt-12 text-2xl font-bold">
        Verify Payment Signature ⭐
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        Verify that a payment callback is genuine (not forged). Use this{" "}
        <strong>BEFORE</strong> fulfilling any order.
      </p>
      <ul className="mt-3 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <strong>Order ID</strong> — from your order creation
        </li>
        <li>
          <strong>Payment ID</strong> —{" "}
          <code className="font-mono text-sm">razorpay_payment_id</code> from
          callback
        </li>
        <li>
          <strong>Signature</strong> —{" "}
          <code className="font-mono text-sm">razorpay_signature</code> from
          callback
        </li>
      </ul>
      <p className="mt-3 text-sm text-foreground/80">
        Output:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.isValid}}"}
        </code>
        ,{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-orange">
          {"{{razorpay.message}}"}
        </code>
      </p>
      <Callout type="danger">
        With <strong>&quot;Throw on Invalid&quot;</strong> ON (recommended), the
        workflow stops automatically if the signature is invalid.
      </Callout>
      <Callout type="tip">
        <strong>Recommended workflow:</strong> Webhook → Verify Signature →
        Update Database → Send WhatsApp
      </Callout>

      <PrevNextLinks />
    </>
  );
}
