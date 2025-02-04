import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

// Load the gRPC protobuf definition
const PROTO_PATH = "./src/protos/ticket.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load the package definition
const grpcObject = grpc.loadPackageDefinition(packageDefinition) as any;
const ticketPackage = grpcObject.TicketGRPC; // Reference the 'ticket' package

console.log("Loaded gRPC Object:", grpcObject);

// Create gRPC client
const client = new ticketPackage.TicketServiceGrpc(
  "ajeek.qbscocloud.net:47029",
  grpc.credentials.createInsecure()
);

/**
 * Fetch ticket status from gRPC service
 * @param ticketID - The ticket number provided by the user
 * @returns {Promise<{ status: string; details?: string }> }
 */
export const getTicketStatus = (
  ticketID: string
): Promise<{ status: string; details?: string }> => {
  return new Promise((resolve, reject) => {
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 5);

    client.waitForReady(deadline, (err: any) => {
      if (err) {
        console.error("🚨 gRPC connection error:", err);
        reject(new Error("Failed to connect to gRPC server."));
        return;
      }

      client.GetTicketByTicketId(
        { TicketId: ticketID },
        (error: any, response: any) => {
          if (error) {
            console.error("❌ gRPC Error:", error);
            reject(
              new Error(`Failed to fetch ticket status: ${error.message}`)
            );
            return;
          }

          console.log("🔹 gRPC Response:", response);

          // ✅ Handle API failure cases
          if (!response.IsApiHandled) {
            console.error("⚠️ API not handled by gRPC service.");
            resolve({
              status: "API Error",
              details: "Service was unable to process the request.",
            });
            return;
          }

          // ✅ Handle request failures (valid API call but unsuccessful request)
          if (!response.IsRequestSuccess) {
            resolve({
              status: "Not Found",
              details: response.Message || "No records found.",
            });
            return;
          }

          // ✅ Extract ticket details properly
          const ticketDetails = response.TicketDetails;
          if (!ticketDetails) {
            resolve({
              status: "Unknown",
              details: "No ticket details available.",
            });
            return;
          }

          const formattedDetails = `📄 Ticket ID: ${ticketDetails.TicketId}
📌 Status: ${ticketDetails.Status}
🔹 Priority: ${ticketDetails.Priority}
📝 Description: ${ticketDetails.Description}
👤 Created By: ${ticketDetails.CreatedBy}
👷 Updated By: ${ticketDetails.UpdatedBy}
📅 Required Date: ${ticketDetails.RequiredDate}
⏳ Required Time: ${ticketDetails.RequiredTime}`;

          resolve({ status: ticketDetails.Status, details: formattedDetails });
        }
      );
    });
  });
};
