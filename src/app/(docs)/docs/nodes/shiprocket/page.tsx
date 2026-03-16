import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";
import { PropertyTable } from "@/components/docs/property-table";

export const metadata: Metadata = { title: "Shiprocket Node" };

export default function ShiprocketPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Nodes", href: "/docs/nodes" },
          { label: "Shiprocket" },
        ]}
      />

      <h1 className="text-4xl font-bold tracking-tight">Shiprocket Node</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Create orders, generate AWBs, request pickups, track shipments, manage
        returns, and check courier rates — all via Shiprocket&apos;s API. The
        essential node for any Indian D2C store automating its logistics
        pipeline.
      </p>

      {/* Prerequisites */}
      <h2 id="prerequisites" className="mt-12 text-2xl font-bold">
        Prerequisites
      </h2>
      <ul className="mt-3 list-inside list-disc space-y-2 text-foreground/80">
        <li>
          A Shiprocket account at{" "}
          <a
            href="https://shiprocket.in"
            target="_blank"
            rel="noreferrer"
            className="text-orange underline"
          >
            shiprocket.in
          </a>
        </li>
        <li>
          Your Shiprocket login email and password (used for JWT
          authentication)
        </li>
        <li>At least one pickup location (warehouse) set up in Shiprocket</li>
      </ul>

      <Callout type="info">
        Nodebase automatically manages JWT token renewal for every workflow
        execution. You only need to provide email and password once.
      </Callout>

      {/* Credentials */}
      <h2 id="credentials" className="mt-12 text-2xl font-bold">
        Credentials
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Field</th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Description
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Where to find it
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Email",
                "Your Shiprocket account email",
                "The email you use to log in to shiprocket.in",
              ],
              [
                "Password",
                "Your Shiprocket account password",
                "The password you use to log in to shiprocket.in",
              ],
            ].map(([field, desc, where], i) => (
              <tr key={field} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5 font-medium">{field}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{desc}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Operations */}
      <h2 id="operations" className="mt-12 text-2xl font-bold">
        Operations
      </h2>

      {/* CREATE_ORDER */}
      <h3 id="create-order" className="mt-8 text-xl font-semibold">
        Create Order
      </h3>
      <p className="mt-2 text-foreground/80">
        Create a new forward shipment order in Shiprocket. Returns an order ID,
        shipment ID, and AWB code.
      </p>
      <PropertyTable
        properties={[
          {
            name: "orderId",
            type: "string",
            required: true,
            description: "Your internal order ID, e.g. SHP-001 or Razorpay payment ID",
          },
          {
            name: "orderDate",
            type: "string",
            required: true,
            description: "Date in YYYY-MM-DD HH:mm format",
          },
          {
            name: "pickupLocation",
            type: "string",
            required: true,
            description: "Warehouse name exactly as set up in Shiprocket",
          },
          {
            name: "billingName",
            type: "string",
            required: true,
            description: "Customer full name",
          },
          {
            name: "billingAddress",
            type: "string",
            required: true,
            description: "Street address line 1",
          },
          {
            name: "billingCity",
            type: "string",
            required: true,
            description: "City name",
          },
          {
            name: "billingState",
            type: "string",
            required: true,
            description: "State name",
          },
          {
            name: "billingPincode",
            type: "string",
            required: true,
            description: "6-digit PIN code",
          },
          {
            name: "billingEmail",
            type: "string",
            required: true,
            description: "Customer email",
          },
          {
            name: "billingPhone",
            type: "string",
            required: true,
            description: "Customer phone (10 digits)",
          },
          {
            name: "orderItems",
            type: "JSON array",
            required: true,
            description:
              '[{"name":"T-Shirt","sku":"TS-M","units":1,"selling_price":499,"discount":0,"tax":0,"hsn":""}]',
          },
          {
            name: "paymentMethod",
            type: "string",
            required: true,
            description: '"prepaid" or "cod"',
          },
          {
            name: "subTotal",
            type: "number",
            required: true,
            description: "Order total in rupees (not paise)",
          },
          {
            name: "length",
            type: "number",
            required: true,
            description: "Package length in cm",
          },
          {
            name: "breadth",
            type: "number",
            required: true,
            description: "Package breadth in cm",
          },
          {
            name: "height",
            type: "number",
            required: true,
            description: "Package height in cm",
          },
          {
            name: "weight",
            type: "number",
            required: true,
            description: "Package weight in kg",
          },
          {
            name: "shippingIsBilling",
            type: "boolean",
            required: false,
            default: "true",
            description: "If false, separate shipping address fields appear",
          },
          {
            name: "codAmount",
            type: "number",
            required: false,
            description: "COD amount in rupees — required if paymentMethod is cod",
          },
          {
            name: "channelId",
            type: "string",
            required: false,
            description: "Shiprocket channel ID if using multi-channel setup",
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "shiprocket": {
    "order_id": 98765432,
    "shipment_id": 12345678,
    "status": "NEW",
    "awb_code": "1234567890123",
    "courier_name": "BlueDart"
  }
}`}
      />
      <CodeBlock
        language="text"
        title="Example — triggered by Razorpay payment"
        code={`Razorpay Trigger (payment.captured)
→ Shiprocket — Create Order
    orderId:        {{razorpayTrigger.payload.payment.entity.id}}
    orderDate:      {{razorpayTrigger.receivedAt}}
    pickupLocation: Mumbai Warehouse
    billingName:    {{razorpayTrigger.payload.payment.entity.notes.name}}
    billingPhone:   {{razorpayTrigger.payload.payment.entity.contact}}
    billingEmail:   {{razorpayTrigger.payload.payment.entity.email}}
    billingPincode: {{razorpayTrigger.payload.payment.entity.notes.pincode}}
    billingCity:    {{razorpayTrigger.payload.payment.entity.notes.city}}
    billingState:   {{razorpayTrigger.payload.payment.entity.notes.state}}
    billingAddress: {{razorpayTrigger.payload.payment.entity.notes.address}}
    paymentMethod:  prepaid
    subTotal:       {{razorpayTrigger.payload.payment.entity.amount}}
    orderItems:     [{"name":"T-Shirt","sku":"TS-M","units":1,"selling_price":499}]
    length:         30
    breadth:        25
    height:         5
    weight:         0.5`}
      />

      {/* GET_ORDER */}
      <h3 id="get-order" className="mt-8 text-xl font-semibold">
        Get Order
      </h3>
      <p className="mt-2 text-foreground/80">
        Fetch full details of a Shiprocket order by its ID.
      </p>
      <PropertyTable
        properties={[
          {
            name: "shiprocketOrderId",
            type: "string",
            required: true,
            description: "Shiprocket order ID — use {{shiprocket.order_id}}",
          },
        ]}
      />

      {/* CANCEL_ORDER */}
      <h3 id="cancel-order" className="mt-8 text-xl font-semibold">
        Cancel Order
      </h3>
      <p className="mt-2 text-foreground/80">
        Cancel a Shiprocket order before pickup.
      </p>
      <PropertyTable
        properties={[
          {
            name: "shiprocketOrderId",
            type: "string",
            required: true,
            description: "Shiprocket order ID",
          },
          {
            name: "cancelReason",
            type: "string",
            required: true,
            description: "Reason for cancellation",
          },
        ]}
      />

      {/* GENERATE_AWB */}
      <h3 id="generate-awb" className="mt-8 text-xl font-semibold">
        Generate AWB
      </h3>
      <p className="mt-2 text-foreground/80">
        Assign a courier and generate an AWB (Air Waybill) number for a
        shipment. Leave courier ID blank for auto-assignment.
      </p>
      <PropertyTable
        properties={[
          {
            name: "shipmentId",
            type: "string",
            required: true,
            description: "Shipment ID from Create Order — {{shiprocket.shipment_id}}",
          },
          {
            name: "courierId",
            type: "string",
            required: false,
            description: "Leave blank for Shiprocket to auto-select best courier",
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "shiprocket": {
    "awb_code": "1234567890123",
    "courier_name": "Delhivery",
    "shipment_id": 12345678
  }
}`}
      />

      {/* GENERATE_LABEL */}
      <h3 id="generate-label" className="mt-8 text-xl font-semibold">
        Generate Label
      </h3>
      <p className="mt-2 text-foreground/80">
        Generate a shipping label PDF for a shipment. Use the returned URL to
        download or email it.
      </p>
      <PropertyTable
        properties={[
          {
            name: "shipmentId",
            type: "string",
            required: true,
            description: "Shipment ID — {{shiprocket.shipment_id}}",
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "shiprocket": {
    "label_url": "https://shiprocket.co/labels/abc123.pdf"
  }
}`}
      />

      {/* REQUEST_PICKUP */}
      <h3 id="request-pickup" className="mt-8 text-xl font-semibold">
        Request Pickup
      </h3>
      <p className="mt-2 text-foreground/80">
        Schedule a courier pickup for a shipment.
      </p>
      <PropertyTable
        properties={[
          {
            name: "shipmentId",
            type: "string",
            required: true,
            description: "Shipment ID — {{shiprocket.shipment_id}}",
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "shiprocket": {
    "pickup_scheduled_date": "2026-04-02",
    "status": "Pickup Scheduled"
  }
}`}
      />

      {/* TRACK_SHIPMENT */}
      <h3 id="track-shipment" className="mt-8 text-xl font-semibold">
        Track Shipment
      </h3>
      <p className="mt-2 text-foreground/80">
        Get live tracking status and activity history for a shipment using its
        AWB code.
      </p>
      <PropertyTable
        properties={[
          {
            name: "awbCode",
            type: "string",
            required: true,
            description: "AWB code — {{shiprocket.awb_code}}",
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "shiprocket": {
    "tracking_data": { "etd": "2026-04-04", "courier": "Delhivery" },
    "current_status": "In Transit",
    "shipment_track": [
      { "date": "2026-04-01 14:00", "activity": "Shipment picked up" },
      { "date": "2026-04-02 08:00", "activity": "In transit - Delhi Hub" }
    ]
  }
}`}
      />

      {/* GET_ORDER_TRACKING */}
      <h3 id="get-order-tracking" className="mt-8 text-xl font-semibold">
        Get Order Tracking
      </h3>
      <p className="mt-2 text-foreground/80">
        Fetch tracking data using a Shiprocket order ID.
      </p>
      <PropertyTable
        properties={[
          {
            name: "shiprocketOrderId",
            type: "string",
            required: true,
            description: "Shiprocket order ID — {{shiprocket.order_id}}",
          },
        ]}
      />

      {/* CHECK_SERVICEABILITY */}
      <h3 id="check-serviceability" className="mt-8 text-xl font-semibold">
        Check Serviceability
      </h3>
      <p className="mt-2 text-foreground/80">
        Check if a delivery PIN code is serviceable from a pickup PIN code.
      </p>
      <PropertyTable
        properties={[
          {
            name: "pickupPostcode",
            type: "string",
            required: true,
            description: "Warehouse PIN code",
          },
          {
            name: "deliveryPostcode",
            type: "string",
            required: true,
            description: "Customer PIN code",
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "shiprocket": {
    "serviceable": true,
    "data": {
      "available_courier_companies": [
        { "courier_name": "Delhivery", "rate": 45, "etd": "3 Days" }
      ]
    }
  }
}`}
      />

      {/* GET_RATE */}
      <h3 id="get-rate" className="mt-8 text-xl font-semibold">
        Get Rate
      </h3>
      <p className="mt-2 text-foreground/80">
        Compare shipping rates and ETD across all available couriers for a
        shipment.
      </p>
      <PropertyTable
        properties={[
          {
            name: "pickupPostcode",
            type: "string",
            required: true,
            description: "Warehouse PIN code",
          },
          {
            name: "deliveryPostcode",
            type: "string",
            required: true,
            description: "Customer PIN code",
          },
          {
            name: "weight",
            type: "number",
            required: true,
            description: "Package weight in kg",
          },
          {
            name: "cod",
            type: "boolean",
            required: false,
            default: "false",
            description: "Set to true for COD shipments",
          },
        ]}
      />

      {/* CREATE_RETURN */}
      <h3 id="create-return" className="mt-8 text-xl font-semibold">
        Create Return
      </h3>
      <p className="mt-2 text-foreground/80">
        Create a return shipment for an existing order.
      </p>
      <PropertyTable
        properties={[
          {
            name: "shiprocketOrderId",
            type: "string",
            required: true,
            description: "Original Shiprocket order ID",
          },
          {
            name: "orderItems",
            type: "JSON array",
            required: true,
            description: "Items being returned",
          },
          {
            name: "billingName",
            type: "string",
            required: true,
            description: "Customer name",
          },
          {
            name: "billingPhone",
            type: "string",
            required: true,
            description: "Customer phone",
          },
          {
            name: "billingAddress",
            type: "string",
            required: true,
            description: "Pickup address for return",
          },
          {
            name: "billingPincode",
            type: "string",
            required: true,
            description: "Customer PIN code",
          },
        ]}
      />

      {/* GET_PICKUP_LOCATIONS */}
      <h3 id="get-pickup-locations" className="mt-8 text-xl font-semibold">
        Get Pickup Locations
      </h3>
      <p className="mt-2 text-foreground/80">
        List all warehouse / pickup locations configured in your Shiprocket
        account.
      </p>
      <CodeBlock
        language="json"
        title="Output"
        code={`{
  "shiprocket": {
    "shipping_address": [
      { "pickup_location": "Mumbai Warehouse", "pin_code": "400001" }
    ]
  }
}`}
      />

      {/* Complete Workflow Examples */}
      <h2 id="examples" className="mt-12 text-2xl font-bold">
        Complete Workflow Examples
      </h2>

      <h3
        id="example-full-fulfilment"
        className="mt-8 text-xl font-semibold"
      >
        Full Post-Payment Fulfilment Pipeline
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> After Razorpay payment, create order in
        Shiprocket, generate AWB, request pickup, and notify customer.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`Razorpay Trigger (payment.captured)
→ Shiprocket — Create Order
    orderId:      {{razorpayTrigger.payload.payment.entity.id}}
    billingPhone: {{razorpayTrigger.payload.payment.entity.contact}}
    paymentMethod: prepaid
    ...
→ Shiprocket — Generate AWB
    shipmentId: {{shiprocket.shipment_id}}
→ Shiprocket — Request Pickup
    shipmentId: {{shiprocket.shipment_id}}
→ WhatsApp — Send Message
    to:      {{razorpayTrigger.payload.payment.entity.contact}}
    message: "Order confirmed! Tracking ID: {{shiprocket.awb_code}}
              Expected delivery: 3-5 business days."`}
      />

      <h3 id="example-tracking-bot" className="mt-8 text-xl font-semibold">
        WhatsApp Tracking Bot
      </h3>
      <p className="mt-2 text-foreground/80">
        <strong>Use case:</strong> Customer sends an AWB number on WhatsApp and
        gets live tracking status.
      </p>
      <CodeBlock
        language="text"
        title="Workflow"
        code={`WhatsApp Trigger (messageTypes: text)
→ Shiprocket — Track Shipment
    awbCode: {{whatsappTrigger.text}}
→ WhatsApp — Send Message
    to:      {{whatsappTrigger.from}}
    message: "Status: {{shiprocket.current_status}}
              Last event: {{shiprocket.shipment_track[0].activity}}"`}
      />

      {/* Common Issues */}
      <h2 id="issues" className="mt-12 text-2xl font-bold">
        Common Issues &amp; Solutions
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Issue</th>
              <th className="px-4 py-2.5 text-left font-semibold">Cause</th>
              <th className="px-4 py-2.5 text-left font-semibold">Solution</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Pickup location not found",
                "Warehouse name typo or not set up",
                "Use Get Pickup Locations to see exact warehouse names",
              ],
              [
                "AWB generation fails",
                "No courier available for the PIN code",
                "Use Check Serviceability first to verify coverage",
              ],
              [
                "Order creation fails with 422",
                "Missing required fields or invalid dimensions",
                "Ensure all required fields are filled — especially weight, dimensions, and pincode",
              ],
              [
                "Authentication error",
                "Wrong email/password in credential",
                "Re-enter credentials — Shiprocket uses JWT that Nodebase auto-renews",
              ],
            ].map(([issue, cause, solution], i) => (
              <tr key={issue} className={i % 2 ? "bg-muted/30" : ""}>
                <td className="px-4 py-2.5 font-medium">{issue}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{cause}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {solution}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Related Nodes */}
      <h2 id="related" className="mt-12 text-2xl font-bold">
        Related Nodes
      </h2>
      <ul className="mt-3 list-inside list-disc space-y-1 text-foreground/80">
        <li>
          <a
            href="/docs/nodes/razorpay-trigger"
            className="text-orange underline"
          >
            Razorpay Trigger
          </a>{" "}
          — trigger fulfilment on payment captured
        </li>
        <li>
          <a href="/docs/nodes/whatsapp" className="text-orange underline">
            WhatsApp
          </a>{" "}
          — send AWB code and delivery updates to customer
        </li>
        <li>
          <a href="/docs/nodes/msg91" className="text-orange underline">
            MSG91
          </a>{" "}
          — send SMS with tracking link
        </li>
        <li>
          <a href="/docs/nodes/gmail" className="text-orange underline">
            Gmail
          </a>{" "}
          — email shipping label to warehouse staff
        </li>
      </ul>

      <PrevNextLinks />
    </>
  );
}
