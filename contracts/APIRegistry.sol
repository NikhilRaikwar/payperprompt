// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract APIRegistry {
    struct APIService {
        address provider;
        string name;
        string endpoint;
        uint256 pricePerCall; // in token smallest unit
        string[] tags;
        bool active;
        uint256 totalCalls;
    }
    
    mapping(uint256 => APIService) public services;
    uint256 public serviceCount;
    
    event ServiceRegistered(uint256 indexed id, address provider, string name, uint256 price);
    event APICallPaid(uint256 indexed serviceId, address caller, uint256 amount, bytes32 callHash);
    event CallAttested(uint256 indexed serviceId, address caller, bytes32 txHash, uint256 timestamp);
    
    function registerService(
        string memory name,
        string memory endpoint,
        uint256 pricePerCall,
        string[] memory tags
    ) external returns (uint256) {
        serviceCount++;
        services[serviceCount] = APIService({
            provider: msg.sender,
            name: name,
            endpoint: endpoint,
            pricePerCall: pricePerCall,
            tags: tags,
            active: true,
            totalCalls: 0
        });
        emit ServiceRegistered(serviceCount, msg.sender, name, pricePerCall);
        return serviceCount;
    }
    
    function recordCall(uint256 serviceId, bytes32 callHash, bytes32 txHash) external {
        require(services[serviceId].active, "Service not active");
        services[serviceId].totalCalls++;
        emit APICallPaid(serviceId, msg.sender, services[serviceId].pricePerCall, callHash);
        emit CallAttested(serviceId, msg.sender, txHash, block.timestamp);
    }
    
    function getService(uint256 id) external view returns (APIService memory) {
        return services[id];
    }
    
    function getAllServices() external view returns (APIService[] memory) {
        APIService[] memory all = new APIService[](serviceCount);
        for (uint256 i = 1; i <= serviceCount; i++) {
            all[i-1] = services[i];
        }
        return all;
    }
}
