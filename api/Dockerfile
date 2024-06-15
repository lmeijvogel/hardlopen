FROM golang:1.22-alpine3.20

RUN apk add --no-cache tini git gcc musl-dev

WORKDIR /go/src
COPY src/go.mod src/go.sum ./

RUN go mod download && go mod verify
RUN go get github.com/mattn/go-sqlite3 && go install github.com/mattn/go-sqlite3

COPY src ./

ENV CGO_ENABLED=1
RUN go build -v -o /go/bin ./

USER 1000

ENV GIN_MODE=release
ENTRYPOINT ["/sbin/tini", "--"]
CMD /go/bin/api
