# Variables
CONTAINER_NAME=postgres-local-turi
IMAGE_NAME=postgres-local-image
HOST_PORT=4774
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=turidb
DATA_DIR=$(HOME)/dev/.data/turi/postgres-data
DOCKERFILE=./Dockerfile
CONTAINER_CLI ?= podman

# Build the Docker image
build:
	$(CONTAINER_CLI) build -t $(IMAGE_NAME) -f $(DOCKERFILE) .

# Create the data directory if it doesn't exist
$(DATA_DIR):
	mkdir -p $(DATA_DIR)

# Start the PostgreSQL container
start: $(DATA_DIR)
	$(CONTAINER_CLI) run --name $(CONTAINER_NAME) \
		-e POSTGRES_USER=$(POSTGRES_USER) \
		-e POSTGRES_PASSWORD=$(POSTGRES_PASSWORD) \
		-e POSTGRES_DB=$(POSTGRES_DB) \
		-v $(DATA_DIR):/var/lib/postgresql/data \
		-p $(HOST_PORT):5432 \
		-d $(IMAGE_NAME)
	@echo "PostgreSQL is running on localhost:$(HOST_PORT)"
	@echo "Connection string: postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:$(HOST_PORT)/$(POSTGRES_DB)"

# Stop the PostgreSQL container
stop:
	$(CONTAINER_CLI) stop $(CONTAINER_NAME) || true

# Remove the PostgreSQL container
remove:
	$(CONTAINER_CLI) rm $(CONTAINER_NAME) || true

# Restart the PostgreSQL container
restart: stop remove start

# Execute psql in the container
psql:
	$(CONTAINER_CLI) exec -it $(CONTAINER_NAME) psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

# View logs
logs:
	$(CONTAINER_CLI) logs $(CONTAINER_NAME)

# Clean everything
clean: remove
	sudo $(CONTAINER_CLI) rmi $(IMAGE_NAME) || true
	sudo rm -rf $(DATA_DIR)

.PHONY: build start stop remove restart psql logs clean