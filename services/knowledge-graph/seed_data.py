import os
import sys

# Ensure local module path resolution
sys.path.append(os.path.dirname(__file__))

def seed_database():
    try:
        from schema import driver, create_constraints_and_seed
        create_constraints_and_seed()
        
        query = """
        // Clear existing data
        MATCH (n) DETACH DELETE n;
        
        // Create 7 Microservices & Dependency Mesh
        MERGE (ingress:Service {name: 'ingress-gateway', type: 'gateway'})
        MERGE (payment:Service {name: 'payment-api', type: 'api'})
        MERGE (auth:Service {name: 'auth-service', type: 'api'})
        MERGE (order:Service {name: 'order-processor', type: 'worker'})
        MERGE (notification:Service {name: 'notification-svc', type: 'service'})
        MERGE (db:Service {name: 'db-primary', type: 'database'})
        MERGE (invdb:Service {name: 'inventory-db', type: 'database'})

        MERGE (ingress)-[:DEPENDS_ON]->(auth)
        MERGE (ingress)-[:DEPENDS_ON]->(payment)
        MERGE (payment)-[:DEPENDS_ON]->(db)
        MERGE (payment)-[:DEPENDS_ON]->(notification)
        MERGE (auth)-[:DEPENDS_ON]->(db)
        MERGE (order)-[:DEPENDS_ON]->(invdb)
        
        MERGE (inc1:Incident {id: 'INC-2026-0812'})
        MERGE (payment)-[:HAD_INCIDENT]->(inc1)
        """
        
        with driver.session() as session:
            session.run(query)
            print("Knowledge Graph seeded with 7 microservice nodes and dependency mesh.")
    except ImportError as ie:
        print(f"Neo4j driver import skipped: {ie}")
    except Exception as e:
        print(f"Neo4j seeding skipped (Database offline or initializing): {e}")

if __name__ == "__main__":
    seed_database()
