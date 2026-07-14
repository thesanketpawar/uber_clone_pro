resource "aws_instance" "control_plane" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.private_subnet_1.id
  key_name               = "uber-clone-key"
  vpc_security_group_ids = [aws_security_group.control_plane_sg.id]
  associate_public_ip_address = false

  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  tags = {
    Name = "Control-Plane"
  }
}

resource "aws_instance" "worker1" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.private_subnet_1.id
  key_name               = "uber-clone-key"
  vpc_security_group_ids = [aws_security_group.worker_sg.id]
  associate_public_ip_address = false

  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  tags = {
    Name = "Worker-1"
  }
}

resource "aws_instance" "worker2" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.private_subnet_2.id
  key_name               = "uber-clone-key"
  vpc_security_group_ids = [aws_security_group.worker_sg.id]
  associate_public_ip_address = false

  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  tags = {
    Name = "Worker-2"
  }
}

resource "aws_instance" "jenkins" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public_subnet_1.id
  key_name               = "uber-clone-key"
  vpc_security_group_ids = [aws_security_group.jenkins_sg.id]
  associate_public_ip_address = true

  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  # User Data सिर्फ Jenkins में
  user_data = file("${path.module}/scripts/install-docker.sh")

  tags = {
    Name = "Jenkins-Server"
  }
}

