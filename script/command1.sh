#!/bin/bash

p1="${1}"
p2="${2}"
p3="${3}"

if [ "$#" -lt 3 ] || [ -z "${p1}" ] || [ -z "${p2}" ] || [ -z "${p3}" ]
then
    echo -e "\n❌ command1.sh - Missing parameter."

    exit 1
fi

parameter1="${p1}"
parameter2="${p2}"
parameter3="${p3}"

if [ "${parameter1}" = "image" ]
then
    trivy image "${parameter2}" --format table >> "${PATH_ROOT}${MS_SS_PATH_FILE}output/${parameter3}.log" 2>&1
elif [ "${parameter1}" = "repository" ]
then
    trivy repository "${parameter2}" --format table >> "${PATH_ROOT}${MS_SS_PATH_FILE}output/${parameter3}.log" 2>&1
fi
