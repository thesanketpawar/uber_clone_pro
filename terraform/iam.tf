# ============================================
# IAM Role for EC2 Instances
# ============================================

resource "aws_iam_role" "ec2_role" {
  name = "uber-clone-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })
}

# ============================================
# Amazon SSM Policy
# Allows Session Manager access to EC2
# ============================================

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# ============================================
# Amazon EBS CSI Driver Policy
# Required for Kubernetes to create/manage
# EBS volumes dynamically
# ============================================

resource "aws_iam_role_policy_attachment" "ebs_csi" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}

# ============================================
# IAM Instance Profile
# This attaches the IAM Role to EC2 instances
# ============================================

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "uber-clone-instance-profile"
  role = aws_iam_role.ec2_role.name
}
