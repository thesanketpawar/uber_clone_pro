# Step 1: IAM Role
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

# Step 2: Attach Policies
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Step 3: Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "uber-clone-instance-profile"
  role = aws_iam_role.ec2_role.name
}
