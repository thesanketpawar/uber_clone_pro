resource "aws_security_group" "jenkins_sg" {

  name        = "jenkins-sg"

  description = "Security Group for Jenkins Server"

  vpc_id = aws_vpc.main.id

  ingress {

    from_port = 22

    to_port = 22

    protocol = "tcp"

    cidr_blocks = ["0.0.0.0/0"]

  }

  ingress {

    from_port = 8080

    to_port = 8080

    protocol = "tcp"

    cidr_blocks = ["0.0.0.0/0"]

  }

  egress {

    from_port = 0

    to_port = 0

    protocol = "-1"

    cidr_blocks = ["0.0.0.0/0"]

  }

  tags = {

    Name = "jenkins-sg"

  }

}


resource "aws_security_group" "control_plane_sg" {

  name = "control-plane-sg"

  description = "Kubernetes Control Plane"

  vpc_id = aws_vpc.main.id

  ingress {

    from_port = 22

    to_port = 22

    protocol = "tcp"

    cidr_blocks = ["0.0.0.0/0"]

  }

  ingress {

    from_port = 6443

    to_port = 6443

    protocol = "tcp"

    cidr_blocks = ["10.0.0.0/16"]

  }

  egress {

    from_port = 0

    to_port = 0

    protocol = "-1"

    cidr_blocks = ["0.0.0.0/0"]

  }

}


resource "aws_security_group" "worker_sg" {

  name = "worker-sg"

  vpc_id = aws_vpc.main.id

  ingress {

    from_port = 22

    to_port = 22

    protocol = "tcp"

    cidr_blocks = ["152.59.34.67/32"]

  }

  ingress {

    from_port = 10250

    to_port = 10250

    protocol = "tcp"

    cidr_blocks = ["10.0.0.0/16"]

  }

  ingress {

    from_port = 30000

    to_port = 32767

    protocol = "tcp"

    cidr_blocks = ["10.0.0.0/16"]

  }

  egress {

    from_port = 0

    to_port = 0

    protocol = "-1"

    cidr_blocks = ["0.0.0.0/0"]

  }

}

resource "aws_security_group" "backend_sg" {

  name = "backend-sg"

  vpc_id = aws_vpc.main.id

  ingress {

    from_port = 4000

    to_port = 4000

    protocol = "tcp"

    cidr_blocks = ["10.0.0.0/16"]

  }

  egress {

    from_port = 0

    to_port = 0

    protocol = "-1"

    cidr_blocks = ["0.0.0.0/0"]

  }

}


resource "aws_security_group" "mongodb_sg" {

  name = "mongodb-sg"

  vpc_id = aws_vpc.main.id

  ingress {

    from_port = 27017

    to_port = 27017

    protocol = "tcp"

    cidr_blocks = ["10.0.0.0/16"]

  }

  egress {

    from_port = 0

    to_port = 0

    protocol = "-1"

    cidr_blocks = ["0.0.0.0/0"]

  }

}
