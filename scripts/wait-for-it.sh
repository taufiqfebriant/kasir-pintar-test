#!/bin/sh
# Use this script to test if a given TCP host/port are available

WAITFORIT_cmdname=${0##*/}

echoerr() { if [ "$WAITFORIT_QUIET" -ne 1 ]; then echo "$@" 1>&2; fi }

usage()
{
    cat << USAGE >&2
Usage:
    $WAITFORIT_cmdname host:port [-s] [-t timeout] [-- command args]
    -h HOST | --host=HOST       Host or IP under test
    -p PORT | --port=PORT       TCP port under test
                                Alternatively, you specify the host and port as host:port
    -s | --strict               Only execute subcommand if the test succeeds
    -q | --quiet                Don't output any status messages
    -t TIMEOUT | --timeout=TIMEOUT
                                Timeout in seconds, zero for no timeout
    -- COMMAND ARGS             Execute command with args after the test finishes
USAGE
    exit 1
}

wait_for()
{
    if [ "$WAITFORIT_TIMEOUT" -gt 0 ]; then
        echoerr "$WAITFORIT_cmdname: waiting $WAITFORIT_TIMEOUT seconds for $WAITFORIT_HOST:$WAITFORIT_PORT"
    else
        echoerr "$WAITFORIT_cmdname: waiting for $WAITFORIT_HOST:$WAITFORIT_PORT without a timeout"
    fi
    WAITFORIT_start_ts=$(date +%s)
    while :
    do
        nc -z "$WAITFORIT_HOST" "$WAITFORIT_PORT" >/dev/null 2>&1
        WAITFORIT_result=$?
        if [ "$WAITFORIT_result" -eq 0 ]; then
            WAITFORIT_end_ts=$(date +%s)
            echoerr "$WAITFORIT_cmdname: $WAITFORIT_HOST:$WAITFORIT_PORT is available after $((WAITFORIT_end_ts - WAITFORIT_start_ts)) seconds"
            break
        fi
        sleep 1
    done
    return "$WAITFORIT_result"
}

# process arguments
while [ "$#" -gt 0 ]
do
    case "$1" in
        *:*)
            WAITFORIT_HOST=$(echo "$1" | cut -d':' -f1)
            WAITFORIT_PORT=$(echo "$1" | cut -d':' -f2)
            shift 1
            ;;
        -q | --quiet)
            WAITFORIT_QUIET=1
            shift 1
            ;;
        -s | --strict)
            WAITFORIT_STRICT=1
            shift 1
            ;;
        -h)
            WAITFORIT_HOST="$2"
            if [ -z "$WAITFORIT_HOST" ]; then break; fi
            shift 2
            ;;
        --host=*)
            WAITFORIT_HOST="${1#*=}"
            shift 1
            ;;
        -p)
            WAITFORIT_PORT="$2"
            if [ -z "$WAITFORIT_PORT" ]; then break; fi
            shift 2
            ;;
        --port=*)
            WAITFORIT_PORT="${1#*=}"
            shift 1
            ;;
        -t)
            WAITFORIT_TIMEOUT="$2"
            if [ -z "$WAITFORIT_TIMEOUT" ]; then break; fi
            shift 2
            ;;
        --timeout=*)
            WAITFORIT_TIMEOUT="${1#*=}"
            shift 1
            ;;
        --)
            shift
            WAITFORIT_CLI="$@"
            break
            ;;
        --help)
            usage
            ;;
        *)
            echoerr "Unknown argument: $1"
            usage
            ;;
    esac
done

if [ -z "$WAITFORIT_HOST" ] || [ -z "$WAITFORIT_PORT" ]; then
    echoerr "Error: you need to provide a host and port to test."
    usage
fi

WAITFORIT_TIMEOUT=${WAITFORIT_TIMEOUT:-15}
WAITFORIT_STRICT=${WAITFORIT_STRICT:-0}
WAITFORIT_QUIET=${WAITFORIT_QUIET:-0}

wait_for
WAITFORIT_RESULT=$?

if [ -n "$WAITFORIT_CLI" ]; then
    if [ "$WAITFORIT_RESULT" -ne 0 ] && [ "$WAITFORIT_STRICT" -eq 1 ]; then
        echoerr "$WAITFORIT_cmdname: strict mode, refusing to execute subprocess"
        exit "$WAITFORIT_RESULT"
    fi
    exec $WAITFORIT_CLI
else
    exit "$WAITFORIT_RESULT"
fi
