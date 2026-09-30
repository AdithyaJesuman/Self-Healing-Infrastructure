import os
from neo4j import GraphDatabase
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "devpassword123")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
app = FastAPI(title="Knowledge Graph API")

def create_constraints_and_seed():
    """Ensures constraints are set up and seeds topology if Neo4j is empty."""
    try:
        with driver.session() as session:
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (s:Service) REQUIRE s.name IS UNIQUE")
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (i:Incident) REQUIRE i.id IS UNIQUE")
            
            # Check node count
            res = session.run("MATCH (n) RETURN count(n) AS cnt")
            record = res.single()
            count = record["cnt"] if record else 0
            
            if count == 0:
                print("Neo4j is empty. Auto-seeding 7 microservice nodes and dependency edges...")
                seed_query = """
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
                session.run(seed_query)
                print("Neo4j auto-seeding complete.")
            else:
                print(f"Neo4j Knowledge Graph online with {count} existing nodes.")
    except Exception as e:
        print(f"Neo4j connection note: {e}")

@app.on_event("startup")
def startup_event():
    create_constraints_and_seed()

def get_graph_context_query(tx, service_name):
    query = """
    MATCH (target:Service {name: $service_name})
    
    // Find what it depends on (1 hop outgoing)
    OPTIONAL MATCH (target)-[:DEPENDS_ON]->(dep:Service)
    WITH target, collect(DISTINCT dep.name) AS depends_on
    
    // Find what depends on it (1 hop incoming)
    OPTIONAL MATCH (target)<-[:DEPENDS_ON]-(depBy:Service)
    WITH target, depends_on, collect(DISTINCT depBy.name) AS depended_on_by
    
    // Blast radius: anything reachable within 2 hops incoming
    OPTIONAL MATCH (target)<-[:DEPENDS_ON*1..2]-(reach:Service)
    WITH target, depends_on, depended_on_by, collect(DISTINCT reach.name) AS blast_radius
    
    // Past incidents
    OPTIONAL MATCH (target)-[:HAD_INCIDENT]->(inc:Incident)
    WITH depends_on, depended_on_by, blast_radius, collect(DISTINCT inc.id) AS similar_past_incidents
    
    RETURN depends_on, depended_on_by, blast_radius, similar_past_incidents
    """
    result = tx.run(query, service_name=service_name)
    record = result.single()
    if not record:
        return None
        
    return {
        "service_name": service_name,
        "depends_on": record["depends_on"],
        "depended_on_by": record["depended_on_by"],
        "blast_radius": record["blast_radius"],
        "similar_past_incidents": record["similar_past_incidents"]
    }

@app.get("/graph-context/{service_name}")
def get_graph_context(service_name: str):
    with driver.session() as session:
        context = session.execute_read(get_graph_context_query, service_name)
        
    if not context:
        raise HTTPException(status_code=404, detail="Service not found in Knowledge Graph")
        
    return context

class LearnedFix(BaseModel):
    service_name: str
    action: str
    incident_id: str

@app.post("/learn-fix")
def learn_fix(fix: LearnedFix):
    query = """
    MATCH (s:Service {name: $service_name})
    MERGE (a:Action {name: $action})
    MERGE (s)-[r:HAS_PROVEN_FIX]->(a)
    ON CREATE SET r.success_count = 1, r.last_incident = $incident_id
    ON MATCH SET r.success_count = r.success_count + 1, r.last_incident = $incident_id
    RETURN r.success_count AS count
    """
    with driver.session() as session:
        result = session.run(query, service_name=fix.service_name, action=fix.action, incident_id=fix.incident_id)
        record = result.single()
        count = record["count"] if record else 0
        
    print(f"🧠 [KNOWLEDGE GRAPH] Learned fix '{fix.action}' for '{fix.service_name}'. Success count: {count}")
    return {"status": "learned", "success_count": count}

if __name__ == "__main__":
    create_constraints_and_seed()
    uvicorn.run(app, host="0.0.0.0", port=8001)
