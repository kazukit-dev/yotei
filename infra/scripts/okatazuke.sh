#!/bin/bash

op plugin run -- terraform destroy \
    -target=module.elb.aws_lb.main \
    -target=module.security_group \
    -target=module.ecs \
    -target=module.vpc-endpoint