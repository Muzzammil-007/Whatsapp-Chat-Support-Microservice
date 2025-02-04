import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

// Load the protobuf
const PROTO_PATH = './src/protos/ticket.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const ticketProto = grpc.loadPackageDefinition(packageDefinition).ticket as any;

// Dummy database
const ticketDB: { [key: string]: string } = {
  123: 'In Progress',
  456: 'Resolved',
  789: 'Pending',
};

// Implement GetTicketStatus function
const getTicketStatus = (call: any, callback: any) => {
  const ticketID = call.request.ticketID;
  const status = ticketDB[ticketID] || 'Ticket not found';
  callback(null, { status });
};

// Start gRPC Server
const server = new grpc.Server();
server.addService(ticketProto.TicketService.service, { GetTicketByTicketId: getTicketStatus });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('🚀 gRPC Server running on port 50051');
});
