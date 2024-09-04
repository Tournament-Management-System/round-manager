# Round Manager

## Overview
The Round Manager is the core orchestration engine of our Tournament Management System. It handles the complex task of scheduling tournament rounds based on user-defined formats and available resources.

## Key Features
- Dynamic round scheduling based on customizable tournament formats
- Resource allocation for competitors and judges
- Advancement logic for multi-round tournaments
- Winner computation using configurable criteria

## How It Works
1. **Format Interpretation**: Parses user-defined tournament structures (e.g., 6 competitors and 3 judges per group)
2. **Resource Management**: Allocates available competitors and judges to groups
3. **Advancement Handling**: Manages progression (e.g., top 30 competitors advance to the next round)
4. **Winner Calculation**: Determines tournament champions based on specified rules

## Technical Details
- Implemented in Node.js
- Utilizes AWS Lambda for serverless execution
- Integrates with AWS AppSync for GraphQL API interactions
- Stores and retrieves data from AWS DynamoDB

## Key Functions
- `assignNextRound`: Creates brackets for the next tournament round
- `getGroupRankings`: Determines competitor rankings based on judging criteria
- `tabulateEventResults`: Calculates final tournament standings

## Testing
Our testing suite ensures the reliability and functionality of the Round Manager. It consists of 3 main test suites with a total of 33 tests:

1. **EventUtil.test.js**: Tests individual components of the core bracket assignment algorithm, including score calculation, advancement logic, and bracket sizing.

2. **Handler.test.js**: Provides end-to-end functionality testing for `start_rounds` and `complete_rounds` operations.

3. **Index.test.js**: Verifies integration with AWS API Gateway, ensuring correct payload handling.

To run the tests:
```bash
npm run test 
```

## Integration
After scheduling a round, the Round Manager hands off control to the Group Manager for execution of individual competition groups.

## Performance
Optimized to handle tournaments with 1000+ competitors, ensuring efficient resource utilization and rapid round transitions.

## Future Enhancements
- [ ] Implement machine learning for optimal group assignments
- [ ] Integrate with AI-powered judging systems
- [ ] Enhance user interface for tournament setup and monitoring

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/Tournament-Management-System/round-manager/blob/main/LICENSE) file for details.