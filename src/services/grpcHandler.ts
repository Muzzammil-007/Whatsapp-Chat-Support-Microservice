import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

// Load the gRPC protobuf definition
const PROTO_PATH = './src/protos/ticket.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load the package definition
const grpcObject = grpc.loadPackageDefinition(packageDefinition) as any;
const ticketPackage = grpcObject.ticket; // Reference the 'ticket' package

console.log('Loaded gRPC Object:', grpcObject);

// Create gRPC client
const client = new ticketPackage.TicketService('127.0.0.1:50051', grpc.credentials.createInsecure());

/**
 * Fetch ticket status from gRPC service
 * @param ticketID - The ticket number provided by the user
 * @returns {Promise<{ status: string }>}
 */
export const getTicketStatus = (ticketID: any): Promise<{ status: string }> => {
  return new Promise((resolve, reject) => {
    // Set a deadline for the gRPC call (e.g., 5 seconds)
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 5);

    // Check if the client is ready
    client.waitForReady(deadline, (err:any) => {
      if (err) {
        console.error('gRPC connection error:', err);
        reject(new Error('Failed to connect to gRPC server.'));
        return;
      }

      // Make the gRPC call 
      client.GetTicketStatus({ ticketID },(error: any, response: any) => {
        if (error) {
          console.error('gRPC Error:', error);
          reject(new Error(`Failed to fetch ticket status: ${error.message}`));
        } else {
          resolve(response);
        }
      });
    });
  });
};

// // Test connection function
// const testConnection = async () => {
//   try {
//     const response = await getTicketStatus('456'); // Use a dummy ticket ID
//     console.log('gRPC connection test successful:', response);
//   } catch (error) {
//     console.error('gRPC connection test failed:', error);
//   }
// };

// // Run the test connection
// testConnection();